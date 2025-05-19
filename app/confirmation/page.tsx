"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Home, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRegistrationByReferenceNumber } from "@/hooks/use-mutations";
import { toast } from "sonner";

export default function ConfirmationPage() {
  const router = useRouter();
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  // Load reference number from sessionStorage
  useEffect(() => {
    const storedRef = sessionStorage.getItem("4dk-confirmation");

    if (!storedRef) {
      // No reference number found, redirect to registration page
      toast.error("Uh oh! Something went wrong.", {
        description:
          "Your payment information was not found. Please start over.",
      });
      router.push("/");
      return;
    }

    setReferenceNumber(storedRef);
  }, [router, toast]);

  // Fetch registration details using the query hook
  const {
    data: registrationResult,
    isLoading,
    isError,
  } = useRegistrationByReferenceNumber(referenceNumber);
  const registrationDetails = registrationResult?.success
    ? registrationResult.data
    : null;

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-950 to-slate-900 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 text-teal-400 animate-spin" />
          <p className="text-slate-300">Loading confirmation...</p>
        </div>
      </main>
    );
  }

  // If no reference number or registration details are available after loading
  if (!referenceNumber || isError || !registrationDetails) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-950 to-slate-900 dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Expired</CardTitle>
            <CardDescription>
              Your payment information was not found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please return to the registration page to start over.</p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => router.push("/")}
            >
              Return to Registration
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-950 to-slate-900 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-teal-900/50 p-3 rounded-full">
              <CheckCircle className="h-12 w-12 text-teal-400" />
            </div>
            <CardTitle className="text-2xl">Registration Complete!</CardTitle>
            <CardDescription>
              Thank you for registering for the 4DK Dance Concert
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>
              We've received your registration and payment confirmation. Your
              tickets will be sent to your email shortly.
            </p>
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm text-muted-foreground">Reference Number</p>
              <p className="font-mono font-medium">{referenceNumber}</p>
            </div>
            <div className="bg-muted p-4 rounded-md text-left">
              <p className="text-sm text-muted-foreground mb-2">
                Registration Details
              </p>
              <p>
                <span className="font-medium">Name:</span>{" "}
                {registrationDetails.fullName}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {registrationDetails.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {registrationDetails.phone}
              </p>
              <p>
                <span className="font-medium">Total Amount:</span> ₱
                {registrationDetails.totalPrice.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {registrationDetails.status}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please keep this reference number for your records. If you have
              any questions, please contact us at support@4dk.example.com
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/" className="w-full">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
