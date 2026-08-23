import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", (req, res) => {
    console.log("Health check endpoint called");
    res.status(200).json({ status: "UP" });
});

export default healthRouter;