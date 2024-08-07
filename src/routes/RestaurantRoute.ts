import express from "express"
import { validateMySearchCity } from "../middleware/validation";
import RestaurantController from "../controllers/RestaurantController";

const router = express.Router();

router.get(
    "/search/:city", 
    validateMySearchCity,
    RestaurantController.searchRestaurants,
)

export default router;