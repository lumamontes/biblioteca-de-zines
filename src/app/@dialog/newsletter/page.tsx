"use client";
import { useRouter } from "next/navigation";
import { Dialog } from "../_components/dialog";
import Image from "next/image";
import { FormEvent, useState } from "react";

export default function NewsletterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(result.error || "An error occurred. Please try again later.");
      }
    } catch (error) {
      console.log(error)
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <div className="w-full max-w-xl mx-auto h-full  bg-white rounded-md relative border-black border-8  max-h-[500px] flex flex-col justify-between">
        <header className="bg-black flex justify-between items-center p-3 ">
          <h2 className="text-base text-white">Subscribe to newsletter</h2>
          <button
            type="button"
            className="bg-red-600 p-2 border-white border-2 rounded-md hover:bg-red-700 transition duration-300"
            onClick={() => router.back()}
          >
            <Image src="/close.svg" alt="Close" width={24} height={24} />
          </button>
        </header>
        <div className="flex-grow flex flex-col justify-center py-6 px-4 sm:px-6 md:px-8">
          {loading && <p className="text-center">Subscribing...</p>}
          {!loading && success && (
            <div className="flex flex-col gap-5">
              <p className="text-center">
                Subscribed! Check the provided email to confirm your
                subscription :)
              </p>
              <button
                onClick={() => router.back()}
                className="text-base px-4 py-3 border border-black hover:bg-neutral-100 transition duration-300 mx-auto"
              >
                Return to home
              </button>
            </div>
          )}
          {!loading && !success && (
            <>
              {error && <p className="text-center text-red-500">{error}</p>}
              <div className="flex flex-col gap-5">
                <p className="text-center">
                  Register your best email if you&rsquo;d like to receive the
                  official newsletter straight to your inbox!
                </p>
                <form
                  className="flex flex-col gap-2"
                  onSubmit={handleSubscribe}
                >
                  <label htmlFor="email" className="text-base" aria-required>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="korra@gmail.com"
                    className="p-2 border border-black rounded-md"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                  />
                  <div className="flex justify-end gap-3 pt-6">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="text-base px-4 py-3 border border-black rounded-md hover:bg-neutral-100 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="text-base px-4 py-3 border border-black rounded-md hover:bg-neutral-100 transition duration-300"
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
