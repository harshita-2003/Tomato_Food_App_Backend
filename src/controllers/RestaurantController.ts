import { Request, Response } from "express";
import Restaurant from "../models/restaurant";

const searchRestaurants = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;

    //four queries for search filters
    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    //query can take any type
    let query: any = {};

    // London = london , ignores the case
    query["city"] = new RegExp(city, "i");
    const cityCheck = await Restaurant.countDocuments(query);
    if (cityCheck == 0) {
      return res.status(404).json({
        data : [],
        pagination : {
            total : 0,
            page : 1,
            pages: 1
        }
      });
    }

    if (selectedCuisines) {
      //selectedCuisines : italian,chinese,mexican
      const cuisinesArray = selectedCuisines
        .split(",")
        .map((cuisine) => new RegExp(cuisine, "i"));
      query["cuisines"] = { $all: cuisinesArray };
    }

    if (searchQuery) {
      //restaurant nname = hungry hites
      // cuisines = [pizza,pasta]
      //searchQuery = Pasta
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { restaurantName: searchRegex },
        { cuisines: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const restaurants = await Restaurant.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Restaurant.countDocuments(query);

    const response  = {
      data : restaurants,
      pagination : {
          total,
          page,
          pages : Math.ceil(total / pageSize) // total = 50 , pagesize = 10 > pages = 5
      }
    }

    res.json(response);

  } catch (error) {
    console.log("error in search", error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const getRestaurantbyId = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.restaurantId;
    const getRestaurant = await Restaurant.findById(restaurantId);

    if(!getRestaurant) {
      res.status(404).json({message: "restaurant not found"})
    }

    res.json(getRestaurant);
  } catch (error) {
    console.log("error in search", error);
    res.status(500).json({ message: "something went wrong" });
  }
}

export default {
  searchRestaurants,
  getRestaurantbyId,
};
