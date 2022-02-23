// Menu: Emoji
// Shortcut:
// Twitter: @vjthlk
// Author: Vojta Holik

/** @type {import("@johnlindquist/kit")} */

import "@johnlindquist/kit";

const { emojis, write } = await db("emojis-db", {
  emojis: [],
});

let emojiPath = tmpPath(`emoji.json`);

if (!(await isFile(emojiPath))) {
  await download(
    `https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json`,
    tmpPath()
  );
}

let emojiJson = await readJson(emojiPath);

let emojiJsonHistory = emojis.map((e) => {
  return _.find(emojiJson, { emoji: e });
});

const mode = (arr) =>
  arr.reduce(
    (a, b, i, arr) =>
      arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length
        ? a
        : b,
    null
  );

let mostUsed = mode(emojiJsonHistory);

let history = _.uniq(
  [...emojiJsonHistory]
    .filter((e) => e.description !== mostUsed.description)
    .reverse()
);

let emojiList = [
  ...history.slice(0, 1),
  mostUsed,
  ...history.slice(1, 5),
  ...emojiJson.filter((e) => {
    return !history.includes(e);
  }),
].filter((v) => !!v);

let selectedEmoji = await arg(
  "Search",
  emojiList.map((e) => {
    return {
      name: `${e.emoji} ${e.description}`,
      description: `${e.category} ${!_.isEmpty(e.tags) ? "-" : ""} ${e.tags.map(
        (tag) => ` ${tag}`
      )}`,
      value: e.emoji,
      shortcode: e.tags.map((tag) => ` ${tag}`),
    };
  })
);

emojis.push(!selectedEmoji.name && selectedEmoji);
await write();

await setSelectedText(selectedEmoji);
