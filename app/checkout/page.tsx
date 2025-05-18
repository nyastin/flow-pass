"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Copy, Upload, X, ImageIcon, Loader2, DollarSign } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useUploadFile, useSavePaymentProof } from "@/hooks/use-mutations"

interface TicketItem {
  type: string
  quantity: string
  dancer: string
}

interface PriceBreakdown {
  vipCount: number
  regularCount: number
  vipTotal: number
  regularTotal: number
}

interface FormData {
  registrationId: string
  fullName: string
  email: string
  phone: string
  tickets: TicketItem[]
  specialRequirements?: string
  totalPrice: number
  priceBreakdown: PriceBreakdown
  referenceNumber: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadFileMutation = useUploadFile()
  const savePaymentProofMutation = useSavePaymentProof()

  // Load data from sessionStorage on component mount
  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem("4dk-registration")

      if (!storedData) {
        // No data found, redirect to registration page
        toast({
          title: "Session expired",
          description: "Your registration information was not found. Please fill out the form again.",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      // Parse the stored data
      const parsedData = JSON.parse(storedData) as FormData
      setFormData(parsedData)
    } catch (error) {
      console.error("Error loading registration data:", error)
      toast({
        title: "Error",
        description: "There was a problem loading your registration data. Please try again.",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }, [router, toast])

  const copyReferenceNumber = () => {
    if (!formData) return

    navigator.clipboard.writeText(formData.referenceNumber)
    setCopied(true)
    toast({
      title: "Reference number copied!",
      description: "You can use this when making your payment.",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        })
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setPaymentProof(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        setPaymentProofPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePaymentProof = () => {
    setPaymentProof(null)
    setPaymentProofPreview(null)
    setUploadProgress(0)
  }

  const handleConfirmPayment = async () => {
    if (!formData || !paymentProof) {
      toast({
        title: "Payment proof required",
        description: "Please upload a screenshot of your payment",
        variant: "destructive",
      })
      return
    }

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 300)

    try {
      // Upload the file
      const uploadResult = await uploadFileMutation.mutateAsync({
        file: paymentProof,
        referenceNumber: formData.referenceNumber,
      })

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Failed to upload payment proof")
      }

      // Clear the progress interval
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Save the payment proof
      await savePaymentProofMutation.mutateAsync({
        registrationId: formData.registrationId,
        imageUrl: uploadResult.url,
        referenceNumber: formData.referenceNumber,
      })
    } catch (error) {
      clearInterval(progressInterval)
      setUploadProgress(0)
      console.error("Error processing payment:", error)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-950 to-slate-900 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 text-teal-400 animate-spin" />
          <p className="text-slate-300">Loading checkout information...</p>
        </div>
      </main>
    )
  }

  // If no data is available after loading
  if (!formData) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-950 to-slate-900 dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Expired</CardTitle>
            <CardDescription>Your registration information was not found.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please return to the registration page to fill out the form again.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={() => router.push("/")}>
              Return to Registration
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  const isSubmitting = uploadFileMutation.isPending || savePaymentProofMutation.isPending

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-950 to-slate-900 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to registration
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>Complete your payment to secure your tickets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-medium">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>

                <Separator className="my-2" />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-teal-400" />
                    Tickets:
                  </h4>

                  {formData.tickets.map((ticket, index) => (
                    <div key={index} className="ml-2 grid grid-cols-3 text-sm">
                      <span>
                        {ticket.quantity}x {ticket.type}
                      </span>
                      <span className="text-center">₱{ticket.type === "VIP" ? "800" : "500"} each</span>
                      <span className="text-right">For {ticket.dancer}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-2" />

                {/* Price breakdown */}
                {formData.priceBreakdown && (
                  <>
                    {formData.priceBreakdown.vipCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>VIP Tickets ({formData.priceBreakdown.vipCount}x):</span>
                        <span>₱{formData.priceBreakdown.vipTotal.toLocaleString()}</span>
                      </div>
                    )}

                    {formData.priceBreakdown.regularCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Regular Tickets ({formData.priceBreakdown.regularCount}x):</span>
                        <span>₱{formData.priceBreakdown.regularTotal.toLocaleString()}</span>
                      </div>
                    )}

                    <Separator className="my-2" />
                  </>
                )}

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₱{formData.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Reference Number</h3>
              <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                <code className="font-mono">{formData.referenceNumber}</code>
                <Button variant="ghost" size="icon" onClick={copyReferenceNumber}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Please include this reference number in your GCash payment.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Payment Method</h3>
              <div className="bg-slate-800 p-4 rounded-md text-center">
                <div className="bg-slate-700 p-4 rounded-md mb-3 mx-auto w-48 h-48 flex items-center justify-center">
                  {/* This would be replaced with an actual QR code image */}
                  <div className="border-2 border-dashed border-slate-500 w-full h-full flex items-center justify-center">
                    <p className="text-sm text-slate-300">GCash QR Code</p>
                  </div>
                </div>
                <p className="text-sm">Scan the QR code above with your GCash app to make payment.</p>
                <p className="text-sm font-medium mt-2 text-teal-400">GCash Number: 0917 123 4567</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Upload Payment Proof</h3>
              <div className="bg-slate-800 p-4 rounded-md">
                {!paymentProofPreview ? (
                  <div className="border-2 border-dashed border-slate-600 rounded-md p-6 flex flex-col items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-slate-500 mb-2" />
                    <p className="text-sm text-slate-400 mb-4 text-center">
                      Upload a screenshot of your payment confirmation
                    </p>
                    <Label
                      htmlFor="payment-proof"
                      className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md cursor-pointer flex items-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Label>
                    <Input
                      id="payment-proof"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={removePaymentProof}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="rounded-md overflow-hidden">
                      <Image
                        src={paymentProofPreview || "/placeholder.svg"}
                        alt="Payment proof"
                        width={400}
                        height={300}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-xs text-center mt-1 text-slate-400">Uploading: {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Please upload a clear screenshot of your payment confirmation.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleConfirmPayment}
              disabled={isSubmitting || !paymentProof}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress < 100 ? "Uploading..." : "Processing..."}
                </>
              ) : (
                "I've Completed Payment"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
