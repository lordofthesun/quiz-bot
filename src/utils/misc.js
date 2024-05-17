const {emojis} = require("../misc");

function getCategoryEmoji(category) {
    for (const [key, value] of Object.entries(emojis.categories)) if (category.toLowerCase().startsWith(key)) return value;
    return "❓";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {getCategoryEmoji, capitalizeFirstLetter}