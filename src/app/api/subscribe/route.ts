// import { NextResponse } from "next/server";
// import mailchimp from "@mailchimp/mailchimp_marketing";

// mailchimp.setConfig({
//   apiKey: process.env.MAILCHIMP_API_KEY,
//   server:
//     process.env.MAILCHIMP_API_KEY &&
//     process.env.MAILCHIMP_API_KEY.split("-")[1],
// });

// interface MailchimpError extends Error {
//   status: number;
//   response?: {
//     body?: {
//       title?: string;
//     };
//   };
// }

// export async function POST(request: Request) {
//   const { email } = await request.json();

//   if (!email || !email.includes("@")) {
//     return NextResponse.json(
//       { error: "Please provide a valid email address." },
//       { status: 400 }
//     );
//   }

//   try {
//     if (!process.env.MAILCHIMP_AUDIENCE_ID) {
//       throw new Error("MAILCHIMP_AUDIENCE_ID is not set");
//     }

//     await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID, {
//       email_address: email,
//       status: "pending",
//     });

//     return NextResponse.json(
//       {
//         message:
//           "Subscription request received! Please check your email to confirm the subscription.",
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     const mailchimpError = error as MailchimpError;
//     if (
//       mailchimpError.status === 400 &&
//       mailchimpError.response?.body?.title === "Member Exists"
//     ) {
//       return NextResponse.json(
//         { error: "You're already subscribed!" },
//         { status: 400 }
//       );
//     }
//     return NextResponse.json(
//       { error: "An error occurred. Please try again later." },
//       { status: 500 }
//     );
//   }
// }
