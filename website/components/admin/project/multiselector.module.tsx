import { ReactNode, useEffect, useState } from "react";
import { Entry } from "../index/list.module";
import styles from "./multiselector.module.scss";


export default function MultiselectorInput(props: Props): JSX.Element {

  const [selectableTags, setSelectableTags] = useState<Entry[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const result = props.options.filter(option =>
      !props.active.find(selected =>
        selected.id === option.id
      )
    );

    setSelectableTags(result);
  }, [props.options, props.active]);


  const remove = (option: entry): void => {
    const selected = props.active.filter((o) => o.id !== option.id);
    setSelectableTags((old) => old.concat([option]));
    props.onChange(selected);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const target = e.target;
    const option = props.options.find((o) => o.id === target.value);

    if (option) {
      setQuery("");
      setSelectableTags(selectableTags.filter((o) => o.id !== target.value));

      props.onChange(props.active.concat(option).map(x => ({ id: x.id, name: x.name })));
    } else {
      setQuery(target.value);
    }
  };

  const selected_tag_element = (option: entry): ReactNode => {
    return (
      <span
        key={option.id}
        className={styles.selected}
        onClick={() => remove(option)}
      >
        {option.name}
      </span>);
  };

  const active = props.active.map(selected_tag_element);

  const options = selectableTags.map(x =>
    <option key={x.id} value={x.id}>{x.name}</option>
  );

  return (
    <section className={styles.main} >

      <section className={styles.active}>
        {active.length > 0 ? active : <span>Empty</span>}
      </section>

      <input
        id="search"
        name="search"
        list="options"
        type="search"
        placeholder="Search"
        autoComplete="off"
        onChange={onChange}
        value={query}
      />

      <datalist id="options">
        {options}
      </datalist>

    </section>
  );

}

interface Props {
  options: entry[];
  active: entry[];
  onChange: (selected: entry[]) => void;
}

interface entry {
  id: string;
  name: string;
}