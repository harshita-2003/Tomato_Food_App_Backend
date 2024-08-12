import express from "express"
import { validateMySearchCity } from "../middleware/validation";
import RestaurantController from "../controllers/RestaurantController";

const router = express.Router();

router.get(
    "/:restaurantId",
    RestaurantController.getRestaurantbyId,
)

router.get(
    "/search/:city", 
    validateMySearchCity,
    RestaurantController.searchRestaurants,
)

export default router;