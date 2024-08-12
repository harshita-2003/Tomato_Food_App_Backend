import Stripe from "stripe";
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/Order";
import { Console } from "console";
// import Order from "../models/order";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

type CheckOutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    address: string;
    city: string;
  };
  restaurantId: string;
};

const stripeWebhook = async (req: Request, res: Response) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];

    event = STRIPE.webhooks.constructEvent(
      req.body, 
      sig as string,
      STRIPE_ENDPOINT_SECRET
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed.', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const order = await Order.findById(session.metadata?.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    order.totalAmount = session.amount_total;
    order.status = "paid";

    await order.save();
  }

  res.status(200).send();
};


const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckOutSessionRequest = req.body;

    const restaurant = await Restaurant.findById(
      checkoutSessionRequest.restaurantId
    );

    if (!restaurant) {
      throw new Error("Restaurant doesn't exist");
    }

    const newOrder = new Order({
      restaurant : restaurant ,
      user : req.userId,
      status : "placed" ,
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems : checkoutSessionRequest.cartItems
    })

    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.menuItems
    );

    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      restaurant.deliveryPrice,
      restaurant._id.toString()
    );

    if(!session.url) {
      return res.status(500).json({message: "Error creating stripe session"})
    }

    await newOrder.save()
    res.json({ url : session.url})

  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.raw.message });
  }
};

const createLineItems = (
  checkoutsessionRequest: CheckOutSessionRequest,
  menuItems: MenuItemType[]
) => {
  // 1. foreach cartItem , get the menuItem object from the restaurant toget price
  // 2. foreach cartItem convert to stripe line item
  // 3. return line item array

  const lineItems = checkoutsessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString()
    );

    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.menuItemId} `);
    }

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "inr",
        unit_amount: Math.round(menuItem.price * 100),
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };

    return line_item;
  });

  return lineItems;
};

const createSession = async (lineItems : Stripe.Checkout.SessionCreateParams.LineItem[], orderId: string, deliveryPrice: number , restaurantId: string)  => {
  const sessionData = await STRIPE.checkout.sessions.create({
      line_items: lineItems,
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "Delivery",
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(deliveryPrice * 100),
              currency: "inr",
            },
          },
        },
      ],
      mode: "payment",
      metadata: {
        orderId,
        restaurantId,
      },
      success_url: `${FRONTEND_URL}/order-status?success=true`,
      cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
    });
  
    return sessionData;
}

export default {
  createCheckoutSession,
  stripeWebhook
}