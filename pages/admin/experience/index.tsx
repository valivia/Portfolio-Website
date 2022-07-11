import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import React from "react";
import styles from "@styles/admin.experiences.module.scss";
import { GetServerSideProps } from "next";
import { experience_category, project, tag } from "@prisma/client";
import onChangeParser from "@components/onchange";
import Item from "@components/admin_experience/experience_item.module";
import { submitFormData, submitJson } from "@components/submit";

const apiServer = process.env.NEXT_PUBLIC_API_SERVER;

class AdminExperiences extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      failed: false,
      sending: false,
      new: true,
      current: {
        category: this.props.categories[0],
        used_since: new Date().toLocaleDateString("en-CA"),
        score: 0,
      } as currentTag,
      experiences: this.props.experiences,
    };
  }

  public onChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = onChangeParser(target);
    this.setState({ current: { ...this.state.current, [target.name]: value } });
  }

  public onSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    this.setState({ sending: true });

    this.state.new ? await this.createTag() : await this.updateTag();

    this.setState({ sending: false });
  }

  public createTag = async (): Promise<void> => {
    const data = this.state.current;
    const response = await submitFormData(data as unknown as Record<string, unknown>, "experience", "POST");

    if (response.status !== 200)
      return alert(response.message || "Unknown error");

    const current = response.data.experience as tag;

    this.setState({ experiences: [...this.state.experiences, current], new: false });
  }

  public updateTag = async (): Promise<void> => {
    const data = this.state.current;
    const response = await submitJson(data as unknown as Record<string, unknown>, "experience", "POST");

    if (response.status !== 200)
      return alert(response.message || "Unknown error");

    const current = response.data.experience;
    this.setState({ current });
  }

  public setActive = (id: string) => {
    this.setState({ current: this.props.experiences.find(x => x.uuid === id) || {} as tag, new: false });
  }

  public delete = async () => {
    if (!this.state.current.uuid) {
      confirm("Are you sure you want to delete this new item?");
      this.setState({ current: {} as tag, new: true });
      return;
    }
    confirm("Are you sure you want to delete this item from the database?");
    const response = await submitJson({ uuid: this.state.current.uuid }, "experience", "DELETE");

    if (response.status !== 200) {
      alert(response.message || "Unknown error");
      return;
    }


    const experiences = this.state.experiences.filter(x => x.uuid !== this.state.current.uuid);
    this.setState({ current: {} as tag, new: true, experiences });

  }

  async componentDidMount() {
    const result = await fetch(`${apiServer}/auth`, { credentials: "include", mode: "cors", method: "POST" })
      .then(x => { if (x.ok) return true; })
      .catch(() => false);


    if (result) this.setState({ loading: false });
    else this.setState({ loading: false, failed: true });
  }

  render() {
    if (this.state.loading) return <> </>;
    if (this.state.failed) {
      this.props.router.replace("/login");
      return <></>;
    }

    const current = this.state.current;

    return (
      <>
        <Head>
          <title>Edit Tags</title>
          <meta name="theme-color" content="#B5A691" />
          <meta name="description" content="Admin panel" />
        </Head>

        <main className={styles.main}>
          <section className={styles.list}>
            {this.state.experiences.map((exp) => <Item key={exp.uuid} data={exp} setActive={this.setActive} active={exp.uuid == current.uuid} />)}
          </section>
          <section className={styles.edit}>
            <form className={styles.form} onSubmit={x => this.onSubmit(x)}>

              <section>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  onChange={this.onChange}
                  value={current.name || ""}
                  required
                />
              </section>

              <section>
                <label htmlFor="website">Website url</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  onChange={this.onChange}
                  value={current.website || ""}
                />
              </section>

              <section>
                <label htmlFor="project_uuid">notable project uuid</label>
                <input
                  id="project_uuid"
                  name="project_uuid"
                  list="projects"
                  onChange={this.onChange}
                  value={current.project_uuid || ""}
                />
                <datalist id="projects">
                  {this.props.projects.map(x => <option key={x.uuid} value={x.uuid}>{x.name}</option>)}
                </datalist>
              </section>

              <section>
                <label htmlFor="score">confidence level</label>
                <input
                  id="score"
                  name="score"
                  type="range"
                  min={0}
                  max={100}
                  onChange={this.onChange}
                  value={current.score !== undefined ? Number(current.score) : 0}
                  required
                />
                <span>{current.score || 0}</span>
              </section>

              <section>
                <label htmlFor="category">category:</label>
                <select
                  id="category"
                  name="category"
                  onChange={this.onChange}
                  value={current.category || ""}
                  required
                >
                  {this.props.categories.map(category =>
                    <option key={category} value={category}>{category}</option>
                  )}
                </select>
              </section>

              <section>
                <label>Used since</label>
                <input
                  type="date"
                  name="used_since"
                  onChange={this.onChange}
                  key={current.uuid}
                  defaultValue={
                    new Date(current.used_since).toLocaleDateString("en-CA")
                  }
                  required
                ></input>
              </section>

              {this.state.new &&
                <section>
                  <label htmlFor="icon">Icon</label>
                  <input
                    type="file"
                    name="icon"
                    id="icon"
                    accept="image/svg+xml"
                    onChange={this.onChange}
                    required
                  />
                </section>
              }

              <section>
                <label htmlFor="description">Description:</label>
                <textarea
                  name="description"
                  id="description"
                  maxLength={1024}
                  onChange={this.onChange}
                  value={current.description || ""}
                ></textarea>
              </section>

              <section className={styles.buttons}>
                <input className={styles.submit} type="submit" value="Submit" disabled={this.state.sending} />
                <button type="button" onClick={this.delete}>Delete</button>
              </section>

            </form>
          </section>
        </main >
      </>
    );
  }
}

export default withRouter(AdminExperiences);

export const getServerSideProps: GetServerSideProps = async () => {
  const experienceData = await fetch(
    `${apiServer}/experience`,
    { headers: { authorization: process.env.CLIENT_SECRET as string } }
  ).then(x => x.ok ? x : false);

  const projectData = await fetch(
    `${apiServer}/project`,
    { headers: { authorization: process.env.CLIENT_SECRET as string } }
  ).then(x => x.ok ? x : false);

  const categoryData = await fetch(
    `${apiServer}/enum/experience/category`,
    { headers: { authorization: process.env.CLIENT_SECRET as string } }
  ).then(x => x.ok ? x : false);

  const projects = projectData ? await projectData.json() as project[] : [];
  const categories = categoryData ? await categoryData.json() as string[] : [];
  const experiences = experienceData ? await experienceData.json() as tag[] : [];


  return {
    props: { categories, experiences, projects },
  };
};

export interface Props {
  router: NextRouter;
  experiences: tag[]
  categories: experience_category[];
  projects: project[];
}

export interface State {
  loading: boolean;
  failed: boolean;
  experiences: tag[];
  current: currentTag;
  sending: boolean;
  new: boolean;
}

interface currentTag extends Omit<tag, "used_since"> {
  used_since: string | Date;
}