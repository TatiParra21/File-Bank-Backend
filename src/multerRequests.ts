import express from "express";
import multer from "multer";

const multerRouter = express.Router();

const upload = multer({ dest: "uploads/" });

multerRouter.post("/", upload.single("file"), (req, res) => {
  console.log(req.file);
  res.json({ message: "uploaded", file: req.file });
});

export default multerRouter;