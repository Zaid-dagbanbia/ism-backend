
// parsing Boolean from String
export const boolParse = function(input) {
    try {
        if (typeof input === 'boolean') return input;
        return (/true/i).test(input);
    } catch (error) {
        return false;
    }
}