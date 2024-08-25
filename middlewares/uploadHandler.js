import multer from "multer";
import path from 'path';
import fs from 'fs';
import uniqueName from './tools/uniqueName.js';

const uploadHandler = function(location) {

    // if location does not exist it creates the folder directory:
    if (!fs.existsSync(location)) {
        fs.mkdirSync(location);
    }

    // setting up storage engine with unique file name:
    const storage = multer.diskStorage({
        destination: function(req, file, callback) {

            callback(null, location);

        }, filename: function (req, file, callback) {

            const uName = uniqueName();
            const ext = path.extname(file.originalname);

            // callback(null, file.fileName + '-' + uName + ext);

            callback(null, file.fieldname + '-' + uName + ext);
        }
    });

    return multer({storage: storage});
}

export default uploadHandler;