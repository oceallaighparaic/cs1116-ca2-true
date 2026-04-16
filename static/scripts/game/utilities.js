// Returns a random integer, inclusive
function randint(min,max) {
    return Math.floor(Math.random()*(max-min+1))+min;
}
function array_pop(arr, item) {
    let index = arr.indexOf(item);
    if (index !== -1) arr.splice(index, 1);
    return arr;
}

export { randint, array_pop };