const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const cleanName = file.originalname
            .replace(/\s+/g, '-')   // Replace spaces with dashes
            .replace(/[()]/g, '');
        cb(null, `${Date.now()}-${cleanName}`);
    }
})
const fileFilter = (req, file, cb) => {
   const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
   if(allowedTypes.includes(file.mimetype)){
         cb(null, true);
   } else {
       cb(new Error('Not an image! Please upload an image.'), false);
   }
}
const upload = multer({ storage,fileFilter});
module.exports = upload;