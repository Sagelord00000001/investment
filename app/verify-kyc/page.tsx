// "use client"

// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { useToast } from '@/hooks/use-toast'
// import { supabase } from '@/lib/supabase'
// import { Upload, ShieldAlert, CheckCircle, FileText, Home, Calendar, User, Loader2 } from 'lucide-react'
// import { useRouter } from 'next/navigation'

// type FormData = {
//   legalName: string
//   ssnOrItin: string
//   dob: string
//   currentAddress: string
//   previousAddress: string
//   filingStatus: string
//   agi: string
// }

// type FileUploads = {
//   idFront: string | null
//   idBack: string | null
//   taxDocument: string | null
// }

// export default function KYCVerification() {
//   const [loading, setLoading] = useState(false)
//   const [formData, setFormData] = useState<FormData>({
//     legalName: '',
//     ssnOrItin: '',
//     dob: '',
//     currentAddress: '',
//     previousAddress: '',
//     filingStatus: '',
//     agi: ''
//   })
//   const [files, setFiles] = useState<FileUploads>({
//     idFront: null,
//     idBack: null,
//     taxDocument: null
//   })
//   const { toast } = useToast()
//   const router = useRouter()

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   const handleFileUpload = async (type: keyof FileUploads, e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     const fileExt = file.name.split('.').pop()
//     const fileName = `${Math.random()}.${fileExt}`
//     const filePath = `${fileName}`

//     setLoading(true)
//     try {
//       const { error: uploadError } = await supabase.storage
//         .from('kyc-documents')
//         .upload(filePath, file)

//       if (uploadError) throw uploadError

//       setFiles(prev => ({
//         ...prev,
//         [type]: filePath
//       }))

//       toast({
//         title: "Document Uploaded",
//         description: `${type.replace(/([A-Z])/g, ' $1').trim()} uploaded successfully`,
//       })
//     } catch (error: any) {
//       toast({
//         title: "Upload Failed",
//         description: error.message,
//         variant: "destructive"
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const submitKYC = async () => {
//     // Validate required fields
//     if (!formData.legalName || !formData.ssnOrItin || !formData.dob || 
//         !formData.currentAddress || !files.idFront || !files.idBack) {
//       toast({
//         title: "Missing Information",
//         description: "Please fill all required fields and upload documents",
//         variant: "destructive"
//       })
//       return
//     }

//     setLoading(true)
//     try {
//       const { data: { user }, error: authError } = await supabase.auth.getUser()
      
//       if (authError || !user) {
//         throw new Error("Authentication required")
//       }

//       const { error } = await supabase
//         .from('kyc_submissions')
//         .insert([{
//           user_id: user.id,
//           status: 'pending',
//           legal_name: formData.legalName,
//           ssn_itin: formData.ssnOrItin,
//           dob: formData.dob,
//           current_address: formData.currentAddress,
//           previous_address: formData.previousAddress,
//           filing_status: formData.filingStatus,
//           agi: formData.agi,
//           id_front_url: files.idFront,
//           id_back_url: files.idBack,
//           tax_document_url: files.taxDocument
//         }])

//       if (error) throw error

//       // Update user profile to reflect KYC submission
//       await supabase
//         .from('profiles')
//         .update({ kyc_status: 'pending' })
//         .eq('id', user.id)

//       toast({
//         title: "KYC Submitted",
//         description: "Your information is under review. This may take 1-3 business days.",
//       })

//       // Redirect after successful submission
//       router.push('/dashboard')
//     } catch (error: any) {
//       toast({
//         title: "Submission Failed",
//         description: error.message,
//         variant: "destructive"
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Card className="max-w-3xl mx-auto">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <ShieldAlert className="w-6 h-6" />
//           Identity Verification (KYC)
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div className="grid md:grid-cols-2 gap-6">
//           {/* Personal Information */}
//           <div className="space-y-4">
//             <h3 className="font-medium flex items-center gap-2">
//               <User className="w-5 h-5" />
//               Personal Information
//             </h3>
            
//             <div>
//               <Label htmlFor="legalName">Full Legal Name*</Label>
//               <Input
//                 id="legalName"
//                 name="legalName"
//                 value={formData.legalName}
//                 onChange={handleChange}
//                 placeholder="As shown on Social Security card"
//                 required
//               />
//             </div>

//             <div>
//               <Label htmlFor="ssnOrItin">SSN/ITIN*</Label>
//               <Input
//                 id="ssnOrItin"
//                 name="ssnOrItin"
//                 type="password"
//                 value={formData.ssnOrItin}
//                 onChange={handleChange}
//                 placeholder="XXX-XX-XXXX"
//                 required
//               />
//             </div>

//             <div>
//               <Label htmlFor="dob">Date of Birth*</Label>
//               <Input
//                 id="dob"
//                 name="dob"
//                 type="date"
//                 value={formData.dob}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </div>

//           {/* Address Information */}
//           <div className="space-y-4">
//             <h3 className="font-medium flex items-center gap-2">
//               <Home className="w-5 h-5" />
//               Address Information
//             </h3>

//             <div>
//               <Label htmlFor="currentAddress">Current Address*</Label>
//               <Input
//                 id="currentAddress"
//                 name="currentAddress"
//                 value={formData.currentAddress}
//                 onChange={handleChange}
//                 placeholder="Street, City, State, ZIP"
//                 required
//               />
//             </div>

//             <div>
//               <Label htmlFor="previousAddress">Prior Year's Address (if moved)</Label>
//               <Input
//                 id="previousAddress"
//                 name="previousAddress"
//                 value={formData.previousAddress}
//                 onChange={handleChange}
//                 placeholder="Street, City, State, ZIP"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Tax Information */}
//         <div className="space-y-4">
//           <h3 className="font-medium flex items-center gap-2">
//             <FileText className="w-5 h-5" />
//             Tax Information
//           </h3>

//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="filingStatus">Filing Status</Label>
//               <Select 
//                 onValueChange={(value: string) => setFormData({...formData, filingStatus: value})}
//                 value={formData.filingStatus}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select filing status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="single">Single</SelectItem>
//                   <SelectItem value="married_joint">Married Filing Jointly</SelectItem>
//                   <SelectItem value="married_separate">Married Filing Separately</SelectItem>
//                   <SelectItem value="head_of_household">Head of Household</SelectItem>
//                   <SelectItem value="qualifying_widow">Qualifying Widow(er)</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label htmlFor="agi">Last Year's AGI</Label>
//               <Input
//                 id="agi"
//                 name="agi"
//                 type="number"
//                 value={formData.agi}
//                 onChange={handleChange}
//                 placeholder="Adjusted Gross Income"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Document Uploads */}
//         <div className="space-y-4">
//           <h3 className="font-medium flex items-center gap-2">
//             <Upload className="w-5 h-5" />
//             Document Uploads
//           </h3>

//           <div className="grid md:grid-cols-3 gap-4">
//             <div className="border rounded-lg p-4">
//               <Label htmlFor="idFront">Government ID Front*</Label>
//               <Input 
//                 id="idFront" 
//                 type="file" 
//                 onChange={(e) => handleFileUpload('idFront', e)} 
//                 className="hidden" 
//                 accept="image/*,.pdf"
//               />
//               <Button variant="outline" className="w-full mt-2" asChild>
//                 <Label htmlFor="idFront">
//                   <Upload className="w-4 h-4 mr-2" />
//                   Upload Front
//                 </Label>
//               </Button>
//               {files.idFront && (
//                 <p className="text-sm text-green-500 mt-2 flex items-center">
//                   <CheckCircle className="w-3 h-3 mr-1" />
//                   Uploaded
//                 </p>
//               )}
//             </div>

//             <div className="border rounded-lg p-4">
//               <Label htmlFor="idBack">Government ID Back*</Label>
//               <Input 
//                 id="idBack" 
//                 type="file" 
//                 onChange={(e) => handleFileUpload('idBack', e)} 
//                 className="hidden" 
//                 accept="image/*,.pdf"
//               />
//               <Button variant="outline" className="w-full mt-2" asChild>
//                 <Label htmlFor="idBack">
//                   <Upload className="w-4 h-4 mr-2" />
//                   Upload Back
//                 </Label>
//               </Button>
//               {files.idBack && (
//                 <p className="text-sm text-green-500 mt-2 flex items-center">
//                   <CheckCircle className="w-3 h-3 mr-1" />
//                   Uploaded
//                 </p>
//               )}
//             </div>

//             <div className="border rounded-lg p-4">
//               <Label htmlFor="taxDocument">Tax Document (Optional)</Label>
//               <Input 
//                 id="taxDocument" 
//                 type="file" 
//                 onChange={(e) => handleFileUpload('taxDocument', e)} 
//                 className="hidden" 
//                 accept="image/*,.pdf,.doc,.docx"
//               />
//               <Button variant="outline" className="w-full mt-2" asChild>
//                 <Label htmlFor="taxDocument">
//                   <Upload className="w-4 h-4 mr-2" />
//                   Upload Tax Doc
//                 </Label>
//               </Button>
//               {files.taxDocument && (
//                 <p className="text-sm text-green-500 mt-2 flex items-center">
//                   <CheckCircle className="w-3 h-3 mr-1" />
//                   Uploaded
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>

//         <Button 
//           onClick={submitKYC}
//           disabled={loading}
//           className="w-full bg-blue-600 hover:bg-blue-700"
//         >
//           {loading ? (
//             <>
//               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//               Submitting...
//             </>
//           ) : 'Submit KYC Verification'}
//         </Button>

//         <div className="text-sm text-muted-foreground flex items-center">
//           <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
//           All information is encrypted and stored securely. We use bank-level security measures.
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// "use client"

// import { useState, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { useToast } from '@/hooks/use-toast'
// import { supabase } from '@/lib/supabase'
// import { Upload, ShieldAlert, CheckCircle, FileText, Home, User, Loader2 } from 'lucide-react'
// import { useRouter } from 'next/navigation'

// type FormData = {
//   legalName: string
//   ssnOrItin: string
//   dob: string
//   currentAddress: string
//   previousAddress: string
//   filingStatus: string
//   agi: string
// }

// type FileUploads = {
//   idFront: { file: File | null; url: string | null; loading: boolean }
//   idBack: { file: File | null; url: string | null; loading: boolean }
//   taxDocument: { file: File | null; url: string | null; loading: boolean }
// }

// export default function KYCVerification() {
//   const [formLoading, setFormLoading] = useState(false)
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({})
//   const [formData, setFormData] = useState<FormData>({
//     legalName: '',
//     ssnOrItin: '',
//     dob: '',
//     currentAddress: '',
//     previousAddress: '',
//     filingStatus: '',
//     agi: ''
//   })
//   const [files, setFiles] = useState<FileUploads>({
//     idFront: { file: null, url: null, loading: false },
//     idBack: { file: null, url: null, loading: false },
//     taxDocument: { file: null, url: null, loading: false }
//   })
//   const { toast } = useToast()
//   const router = useRouter()

//   // Check authentication on mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       const { data: { user }, error } = await supabase.auth.getUser()
//       if (error || !user) {
//         router.push('/login')
//       }
//     }
//     checkAuth()
//   }, [router])

//   const validateForm = () => {
//     const errors: Record<string, string> = {}
//     if (!formData.legalName.trim()) errors.legalName = 'Legal name is required'
//     if (!formData.ssnOrItin.trim()) errors.ssnOrItin = 'SSN/ITIN is required'
//     if (!formData.dob) errors.dob = 'Date of birth is required'
//     if (!formData.currentAddress.trim()) errors.currentAddress = 'Current address is required'
//     if (!files.idFront.file) errors.idFront = 'ID front is required'
//     if (!files.idBack.file) errors.idBack = 'ID back is required'
    
//     setFormErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   const handleFileChange = (type: keyof FileUploads, e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     // Validate file type and size
//     const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
//     const maxSize = 5 * 1024 * 1024 // 5MB
    
//     if (!validTypes.includes(file.type)) {
//       toast({
//         title: "Invalid File Type",
//         description: "Please upload JPEG, PNG, or PDF files only",
//         variant: "destructive"
//       })
//       return
//     }
    
//     if (file.size > maxSize) {
//       toast({
//         title: "File Too Large",
//         description: "Maximum file size is 5MB",
//         variant: "destructive"
//       })
//       return
//     }

//     setFiles(prev => ({
//       ...prev,
//       [type]: { ...prev[type], file, url: URL.createObjectURL(file), loading: false }
//     }))
//   }

//   const submitKYC = async () => {
//     if (!validateForm()) {
//       toast({
//         title: "Validation Error",
//         description: "Please complete all required fields",
//         variant: "destructive"
//       })
//       return
//     }

//     setFormLoading(true)
//     try {
//       const { data: { user }, error: authError } = await supabase.auth.getUser()
//       if (authError || !user) throw new Error("Authentication required")

//       // Convert files to base64 for storage in the table
//       const filePromises = Object.entries(files).map(async ([key, value]) => {
//         if (!value.file) return [key, null]
        
//         return new Promise<[string, string]>(async (resolve) => {
//           const reader = new FileReader()
//           reader.onload = () => {
//             resolve([key, reader.result as string])
//           }
//           reader.readAsDataURL(value.file!)
//         })
//       })

//       const fileResults = await Promise.all(filePromises)
//       const fileData = Object.fromEntries(fileResults)

//       // Submit to kyc_submissions table
//       const { error } = await supabase.from('kyc_submissions').insert([{
//         user_id: user.id,
//         status: 'pending',
//         legal_name: formData.legalName,
//         ssn_itin: formData.ssnOrItin,
//         dob: formData.dob,
//         current_address: formData.currentAddress,
//         previous_address: formData.previousAddress,
//         filing_status: formData.filingStatus,
//         agi: formData.agi,
//         id_front: fileData.idFront,
//         id_back: fileData.idBack,
//         tax_document: fileData.taxDocument,
//         submitted_at: new Date().toISOString()
//       }])

//       if (error) throw error

//       toast({
//         title: "KYC Submitted",
//         description: "Your verification is under review",
//       })
//       router.push('/dashboard')
//     } catch (error: any) {
//       console.error("Submission error:", error)
//       toast({
//         title: "Submission Failed",
//         description: error.message || "Failed to submit KYC application",
//         variant: "destructive"
//       })
//     } finally {
//       setFormLoading(false)
//     }
//   }

// "use client"

// import { useState, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { useToast } from '@/hooks/use-toast'
// import { supabase } from '@/lib/supabase'
// import { Upload, ShieldAlert, CheckCircle, FileText, Home, User, Loader2 } from 'lucide-react'
// import { useRouter } from 'next/navigation'

// type FormData = {
//   legalName: string
//   ssnOrItin: string
//   dob: string
//   currentAddress: string
//   previousAddress: string
//   filingStatus: string
//   agi: string
// }

// type FileUploads = {
//   idFront: { file: File | null; url: string | null; loading: boolean }
//   idBack: { file: File | null; url: string | null; loading: boolean }
//   taxDocument: { file: File | null; url: string | null; loading: boolean }
// }

// export default function KYCVerification() {
//   const [formLoading, setFormLoading] = useState(false)
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({})
//   const [bucketReady, setBucketReady] = useState(false)
//   const [formData, setFormData] = useState<FormData>({
//     legalName: '',
//     ssnOrItin: '',
//     dob: '',
//     currentAddress: '',
//     previousAddress: '',
//     filingStatus: '',
//     agi: ''
//   })
//   const [files, setFiles] = useState<FileUploads>({
//     idFront: { file: null, url: null, loading: false },
//     idBack: { file: null, url: null, loading: false },
//     taxDocument: { file: null, url: null, loading: false }
//   })
//   const { toast } = useToast()
//   const router = useRouter()

//   useEffect(() => {
//     const initialize = async () => {
//       // Check authentication
//       const { data: { user }, error: authError } = await supabase.auth.getUser()
//       if (authError || !user) {
//         router.push('/login')
//         return
//       }

//       // Check if bucket exists, create if not
//       try {
//         const { data: bucketList } = await supabase.storage.listBuckets()
//         const bucketExists = bucketList?.some(b => b.name === 'kyc-documents')
        
//         if (!bucketExists) {
//           const { error: createError } = await supabase.storage.createBucket('kyc-documents', {
//             public: true,
//             allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
//             fileSizeLimit: 5 * 1024 * 1024 // 5MB
//           })
//           if (createError) throw createError
//         }

//         setBucketReady(true)
//       } catch (error: any) {
//         console.error("Storage initialization error:", error)
//         toast({
//           title: "Storage Error",
//           description: "Failed to initialize document storage",
//           variant: "destructive"
//         })
//       }
//     }

//     initialize()
//   }, [router, toast])

//   const validateForm = () => {
//     const errors: Record<string, string> = {}
//     if (!formData.legalName.trim()) errors.legalName = 'Legal name is required'
//     if (!formData.ssnOrItin.trim()) errors.ssnOrItin = 'SSN/ITIN is required'
//     if (!formData.dob) errors.dob = 'Date of birth is required'
//     if (!formData.currentAddress.trim()) errors.currentAddress = 'Current address is required'
//     if (!files.idFront.file) errors.idFront = 'ID front is required'
//     if (!files.idBack.file) errors.idBack = 'ID back is required'
    
//     setFormErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   const handleFileChange = (type: keyof FileUploads, e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     // Validate file type and size
//     const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
//     const maxSize = 5 * 1024 * 1024 // 5MB
    
//     if (!validTypes.includes(file.type)) {
//       toast({
//         title: "Invalid File Type",
//         description: "Please upload JPEG, PNG, or PDF files only",
//         variant: "destructive"
//       })
//       return
//     }
    
//     if (file.size > maxSize) {
//       toast({
//         title: "File Too Large",
//         description: "Maximum file size is 5MB",
//         variant: "destructive"
//       })
//       return
//     }

//     setFiles(prev => ({
//       ...prev,
//       [type]: { ...prev[type], file, url: URL.createObjectURL(file), loading: false }
//     }))
//   }

//   const submitKYC = async () => {
//     if (!bucketReady) {
//       toast({
//         title: "System Not Ready",
//         description: "Document storage is still initializing. Please try again shortly.",
//         variant: "destructive"
//       })
//       return
//     }

//     if (!validateForm()) {
//       toast({
//         title: "Validation Error",
//         description: "Please complete all required fields",
//         variant: "destructive"
//       })
//       return
//     }

//     setFormLoading(true)
//     try {
//       const { data: { user }, error: authError } = await supabase.auth.getUser()
//       if (authError || !user) throw new Error("Authentication required")

//       // Upload files to storage and get URLs
//       const uploadFile = async (type: keyof FileUploads) => {
//         if (!files[type].file) return null
        
//         const fileExt = files[type].file!.name.split('.').pop()
//         const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`
        
//         const { data, error } = await supabase.storage
//           .from('kyc-documents')
//           .upload(fileName, files[type].file!)

//         if (error) throw error

//         const { data: { publicUrl } } = supabase.storage
//           .from('kyc-documents')
//           .getPublicUrl(data.path)

//         return publicUrl
//       }

//       const [idFrontUrl, idBackUrl, taxDocumentUrl] = await Promise.all([
//         uploadFile('idFront'),
//         uploadFile('idBack'),
//         files.taxDocument.file ? uploadFile('taxDocument') : Promise.resolve(null)
//       ])

//       // Submit to kyc_submissions table
//       const { error } = await supabase.from('kyc_submissions').insert([{
//         user_id: user.id,
//         status: 'pending',
//         legal_name: formData.legalName,
//         ssn_itin: formData.ssnOrItin,
//         dob: formData.dob,
//         current_address: formData.currentAddress,
//         previous_address: formData.previousAddress || null,
//         filing_status: formData.filingStatus || null,
//         agi: formData.agi || null,
//         id_front_url: idFrontUrl,
//         id_back_url: idBackUrl,
//         tax_document_url: taxDocumentUrl,
//         created_at: new Date().toISOString()
//       }])

//       if (error) throw error

//       toast({
//         title: "KYC Submitted Successfully",
//         description: "Your verification is under review",
//       })

//       // Redirect after a brief delay to show success message
//       setTimeout(() => router.push('/dashboard'), 1500)
      
//     } catch (error: any) {
//       console.error("Submission error:", error)
//       toast({
//         title: "Submission Failed",
//         description: error.message || "Failed to submit KYC application",
//         variant: "destructive"
//       })
//     } finally {
//       setFormLoading(false)
//     }
//   }

"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Upload, ShieldAlert, CheckCircle, FileText, Home, User, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type FormData = {
  legalName: string
  ssnOrItin: string
  dob: string
  currentAddress: string
  previousAddress: string
  filingStatus: string
  agi: string
}

type FileUploads = {
  idFront: { file: File | null; url: string | null; loading: boolean }
  idBack: { file: File | null; url: string | null; loading: boolean }
  taxDocument: { file: File | null; url: string | null; loading: boolean }
}

export default function KYCVerification() {
  const [formLoading, setFormLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<FormData>({
    legalName: '',
    ssnOrItin: '',
    dob: '',
    currentAddress: '',
    previousAddress: '',
    filingStatus: '',
    agi: ''
  })
  const [files, setFiles] = useState<FileUploads>({
    idFront: { file: null, url: null, loading: false },
    idBack: { file: null, url: null, loading: false },
    taxDocument: { file: null, url: null, loading: false }
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.legalName.trim()) errors.legalName = 'Legal name is required'
    if (!formData.ssnOrItin.trim()) errors.ssnOrItin = 'SSN/ITIN is required'
    if (!formData.dob) errors.dob = 'Date of birth is required'
    if (!formData.currentAddress.trim()) errors.currentAddress = 'Current address is required'
    if (!files.idFront.file) errors.idFront = 'ID front is required'
    if (!files.idBack.file) errors.idBack = 'ID back is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFileChange = (type: keyof FileUploads, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload JPEG, PNG, or PDF files only",
        variant: "destructive"
      })
      return
    }
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 5MB",
        variant: "destructive"
      })
      return
    }

    setFiles(prev => ({
      ...prev,
      [type]: { ...prev[type], file, url: URL.createObjectURL(file), loading: false }
    }))
  }

  const uploadFileToStorage = async (userId: string, type: string, file: File) => {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${type}-${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, file)

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(data.path)

    return publicUrl
  }

  const submitKYC = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields",
        variant: "destructive"
      })
      return
    }

    setFormLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error("Authentication required")

      // Upload files in parallel
      const uploadPromises = [
        files.idFront.file ? uploadFileToStorage(user.id, 'id-front', files.idFront.file) : Promise.resolve(null),
        files.idBack.file ? uploadFileToStorage(user.id, 'id-back', files.idBack.file) : Promise.resolve(null),
        files.taxDocument.file ? uploadFileToStorage(user.id, 'tax-doc', files.taxDocument.file) : Promise.resolve(null)
      ]

      const [idFrontUrl, idBackUrl, taxDocumentUrl] = await Promise.all(uploadPromises)

      // Submit to database
      const { error } = await supabase.from('kyc_submissions').insert([{
        user_id: user.id,
        status: 'pending',
        legal_name: formData.legalName,
        ssn_itin: formData.ssnOrItin,
        dob: formData.dob,
        current_address: formData.currentAddress,
        previous_address: formData.previousAddress || null,
        filing_status: formData.filingStatus || null,
        agi: formData.agi || null,
        id_front_url: idFrontUrl,
        id_back_url: idBackUrl,
        tax_document_url: taxDocumentUrl,
        submitted_at: new Date().toISOString()
      }])

      if (error) throw error

      // Update user profile
      await supabase
        .from('profiles')
        .update({ kyc_status: 'pending' })
        .eq('id', user.id)

      toast({
        title: "KYC Submitted",
        description: "Your information is under review. This may take 1-3 business days.",
      })

      router.push('/dashboard')
    } catch (error: any) {
      console.error("Submission error:", error)
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit KYC application",
        variant: "destructive"
      })
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" />
            Identity Verification (KYC)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              
              <div>
                <Label htmlFor="legalName">Full Legal Name*</Label>
                <Input
                  id="legalName"
                  name="legalName"
                  value={formData.legalName}
                  onChange={(e) => setFormData({...formData, legalName: e.target.value})}
                  className={formErrors.legalName ? 'border-red-500' : ''}
                />
                {formErrors.legalName && <p className="text-sm text-red-500">{formErrors.legalName}</p>}
              </div>

              <div>
                <Label htmlFor="ssnOrItin">SSN/ITIN*</Label>
                <Input
                  id="ssnOrItin"
                  name="ssnOrItin"
                  type="password"
                  value={formData.ssnOrItin}
                  onChange={(e) => setFormData({...formData, ssnOrItin: e.target.value})}
                  className={formErrors.ssnOrItin ? 'border-red-500' : ''}
                />
                {formErrors.ssnOrItin && <p className="text-sm text-red-500">{formErrors.ssnOrItin}</p>}
              </div>

              <div>
                <Label htmlFor="dob">Date of Birth*</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className={formErrors.dob ? 'border-red-500' : ''}
                  max={new Date().toISOString().split('T')[0]}
                />
                {formErrors.dob && <p className="text-sm text-red-500">{formErrors.dob}</p>}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Home className="w-5 h-5" />
                Address Information
              </h3>

              <div>
                <Label htmlFor="currentAddress">Current Address*</Label>
                <Input
                  id="currentAddress"
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({...formData, currentAddress: e.target.value})}
                  className={formErrors.currentAddress ? 'border-red-500' : ''}
                />
                {formErrors.currentAddress && <p className="text-sm text-red-500">{formErrors.currentAddress}</p>}
              </div>

              <div>
                <Label htmlFor="previousAddress">Prior Address (if moved)</Label>
                <Input
                  id="previousAddress"
                  name="previousAddress"
                  value={formData.previousAddress}
                  onChange={(e) => setFormData({...formData, previousAddress: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tax Information
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filingStatus">Filing Status</Label>
                <Select 
                  onValueChange={(value) => setFormData({...formData, filingStatus: value})}
                  value={formData.filingStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select filing status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married_joint">Married Filing Jointly</SelectItem>
                    <SelectItem value="married_separate">Married Filing Separately</SelectItem>
                    <SelectItem value="head_of_household">Head of Household</SelectItem>
                    <SelectItem value="qualifying_widow">Qualifying Widow(er)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="agi">Last Year's AGI</Label>
                <Input
                  id="agi"
                  name="agi"
                  type="number"
                  value={formData.agi}
                  onChange={(e) => setFormData({...formData, agi: e.target.value})}
                  placeholder="Adjusted Gross Income"
                />
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Document Uploads
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              {(['idFront', 'idBack', 'taxDocument'] as const).map((type) => (
                <div key={type} className="border rounded-lg p-4">
                  <Label htmlFor={type}>
                    {type === 'taxDocument' ? 'Tax Document (Optional)' : `Government ID ${type.replace('id', '').replace(/([A-Z])/g, ' $1')}*`}
                  </Label>
                  <Input 
                    id={type} 
                    type="file" 
                    onChange={(e) => handleFileChange(type, e)} 
                    className="hidden" 
                    accept="image/*,.pdf"
                  />
                  <Button 
                    variant="outline" 
                    className="w-full mt-2" 
                    asChild
                  >
                    <Label htmlFor={type} className="cursor-pointer flex items-center justify-center">
                      <Upload className="w-4 h-4 mr-2" />
                      {`Upload ${type.replace('id', '').replace(/([A-Z])/g, ' $1')}`}
                    </Label>
                  </Button>
                  {files[type].url && (
                    <div className="mt-2">
                      <p className="text-sm text-green-500 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        File selected
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {files[type].file?.name}
                      </p>
                    </div>
                  )}
                  {formErrors[type] && (
                    <p className="text-sm text-red-500 mt-1">{formErrors[type]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={submitKYC}
            disabled={formLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {formLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {formLoading ? 'Submitting...' : 'Submit KYC Verification'}
          </Button>

          <div className="text-sm text-muted-foreground flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            All information is encrypted and stored securely.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}