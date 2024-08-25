import fs from 'fs';

const deleter = async function(path, ...fileName) {
    try {

        if (path[path.length -1] !== '/') { path += '/'}

        for (let i = 0 ; i < fileName.length; i++) {
            await fs.unlink(path + fileName[i], err => console.log('deletion_error:',err));
        }

        return true;
    } catch (error) {
        return false;
    }
}


export default deleter;