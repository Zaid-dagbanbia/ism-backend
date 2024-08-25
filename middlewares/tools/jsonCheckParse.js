// This tools check if an input is Json or string
// If it is string it will change it to Json

const jarse = function(input) {

    if (typeof input === 'string') {
        return JSON.parse(input);
    } else {
        return input;
    }
}

export default jarse;