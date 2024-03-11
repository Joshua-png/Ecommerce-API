import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const filename = file.originalname.split(" ").join("");
    cb(null, filename);
  },
});

const upload = multer({ storage });

export default upload;

// import multer from "multer";

// const storage = multer.diskStorage({});

// const fileFilter = (req, file, cb) => {
//   if (!file.mimetype.includes("image")) {
//     return cb("Invalid image format", false);
//   }

//   cb(null, true);
// };

// const upload = multer({ storage, fileFilter });

// export default upload;
