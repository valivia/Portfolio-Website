aaa
# Project
## about
according to all laws of aviation there is **no** way a bee should be able to fly
> kippie is cute

### here is why
- borb
- fluffy

## code
```js

export const getStaticPaths: GetStaticPaths = async () => {
   const res = await fetch(`${cdn}/project`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const data = await res.json() as ProjectQuery[];

  const paths = data.map((project) => { return { params: { id: project.uuid } }; });
  console.log("amogus");

  return {
    paths: paths,
    fallback: "blocking",
  };
};
```

[cute](https://cdn.discordapp.com/attachments/458342133368356875/943861455906799666/IMG_20220216_224157_1.jpg)