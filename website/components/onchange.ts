export default function onChangeParser(target: EventTarget & (HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement)): unknown {
  let value;


  if ("options" in target && target.multiple) {
    const options = (target as HTMLSelectElement).options;
    value = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
  } else if ("files" in target && target.type === "file") {
    if (!target.files) return;
    value = target.files[0];
  } else if ("checked" in target && target.type == "checkbox") {
    value = target.checked;
  } else if (target.type == "range") {
    value = Number(target.value);
  } else if (target.type == "date") {
    value = new Date(target.value);
  } else {
    value = target.value;
  }

  return value;
}