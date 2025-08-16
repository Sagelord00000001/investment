"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShieldAlert, CheckCircle, XCircle, Eye, User, FileText, Home, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

type KYCSubmission = {
  id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
  legal_name: string
  ssn_itin: string
  dob: string
  current_address: string
  previous_address: string | null
  filing_status: string | null
  agi: string | null
  id_front_url: string
  id_back_url: string
  tax_document_url: string | null
  submitted_at: string
  verified_at: string | null
  user_email?: string
  profiles?: {
    email: string
  }
}

export default function KYCAdminPage() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('kyc_submissions')
        .select(`
          *,
          profiles (
            email
          )
        `)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      setSubmissions(data as KYCSubmission[])
    } catch (error) {
      console.error("Error fetching submissions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch KYC submissions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // const updateKYCStatus = async (submissionId: string, status: 'approved' | 'rejected') => {
  //   setProcessingId(submissionId)
  //   try {
  //     // Update KYC submission status
  //     const { error } = await supabase
  //       .from('kyc_submissions')
  //       .update({ 
  //         status,
  //         verified_at: new Date().toISOString(),
  //         reviewer_id: (await supabase.auth.getUser()).data.user?.id
  //       })
  //       .eq('id', submissionId)

  //     if (error) throw error

  //     // Update user's profile status
  //     const submission = submissions.find(s => s.id === submissionId)
  //     if (submission) {
  //       await supabase
  //         .from('profiles')
  //         .update({ kyc_status: status })
  //         .eq('id', submission.user_id)
  //     }

  //     // Update local state
  //     setSubmissions(prev => 
  //       prev.map(s => 
  //         s.id === submissionId ? { ...s, status } : s
  //       )
  //     )

  //     toast({
  //       title: "Success",
  //       description: `KYC submission has been ${status}`,
  //     })
  //   } catch (error) {
  //     console.error("Error updating status:", error)
  //     toast({
  //       title: "Error",
  //       description: "Failed to update KYC status",
  //       variant: "destructive"
  //     })
  //   } finally {
  //     setProcessingId(null)
  //     setSelectedSubmission(null)
  //   }
  // }

  const updateKYCStatus = async (
  submissionId: string,
  status: 'approved' | 'rejected'
) => {
  setProcessingId(submissionId)

  try {
    // Get the current logged-in user's ID for reviewer_id
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) throw userError

    // Update the KYC submission record
    const { error: kycError } = await supabase
      .from('kyc_submissions')
      .update({
        status,
        verified_at: new Date().toISOString(),
        reviewer_id: user?.id // Must match the type of reviewer_id FK
      })
      .eq('id', submissionId)

    if (kycError) throw kycError

    // Find the submission so we can update the related profile
    const submission = submissions.find(s => s.id === submissionId)
    if (submission?.user_id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ kyc_status: status })
        .eq('id', submission.user_id)

      if (profileError) throw profileError
    }

    // Update local state so UI reflects immediately
    setSubmissions(prev =>
      prev.map(s =>
        s.id === submissionId ? { ...s, status } : s
      )
    )

    toast({
      title: 'Success',
      description: `KYC submission has been ${status}.`
    })
  } catch (err) {
    console.error('Error updating status:', err)
    toast({
      title: 'Error',
      description: 'Failed to update KYC status.',
      variant: 'destructive'
    })
  } finally {
    setProcessingId(null)
    setSelectedSubmission(null)
  }
}


  const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'rejected' }) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" />
            KYC Submissions Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No KYC submissions to review
            </div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.legal_name}
                        </TableCell>
                        <TableCell>
                          {submission.profiles?.email || 'No email'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={submission.status} />
                        </TableCell>
                        <TableCell>
                          {formatDate(submission.submitted_at)}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          {submission.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => updateKYCStatus(submission.id, 'approved')}
                                disabled={processingId === submission.id}
                              >
                                {processingId === submission.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => updateKYCStatus(submission.id, 'rejected')}
                                disabled={processingId === submission.id}
                              >
                                {processingId === submission.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4 mr-2" />
                                )}
                                Reject
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Submission Details Modal */}
              {selectedSubmission && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        KYC Submission Details
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedSubmission(null)}
                      >
                        Close
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Personal Information
                        </h3>
                        
                        <div>
                          <p className="text-sm text-gray-500">Full Legal Name</p>
                          <p className="font-medium">{selectedSubmission.legal_name}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          <p className="font-medium">{formatDate(selectedSubmission.dob)}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">SSN/ITIN</p>
                          <p className="font-medium">••••••••••</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium flex items-center gap-2">
                          <Home className="w-5 h-5" />
                          Address Information
                        </h3>

                        <div>
                          <p className="text-sm text-gray-500">Current Address</p>
                          <p className="font-medium">{selectedSubmission.current_address}</p>
                        </div>

                        {selectedSubmission.previous_address && (
                          <div>
                            <p className="text-sm text-gray-500">Previous Address</p>
                            <p className="font-medium">{selectedSubmission.previous_address}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Tax Information
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Filing Status</p>
                          <p className="font-medium">{selectedSubmission.filing_status || 'Not provided'}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Adjusted Gross Income</p>
                          <p className="font-medium">
                            {selectedSubmission.agi ? `$${selectedSubmission.agi}` : 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Submitted Documents
                      </h3>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4">
                          <p className="text-sm font-medium mb-2">Government ID (Front)</p>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            asChild
                          >
                            <a 
                              href={selectedSubmission.id_front_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Document
                            </a>
                          </Button>
                        </div>

                        <div className="border rounded-lg p-4">
                          <p className="text-sm font-medium mb-2">Government ID (Back)</p>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            asChild
                          >
                            <a 
                              href={selectedSubmission.id_back_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Document
                            </a>
                          </Button>
                        </div>

                        {selectedSubmission.tax_document_url ? (
                          <div className="border rounded-lg p-4">
                            <p className="text-sm font-medium mb-2">Tax Document</p>
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              asChild
                            >
                              <a 
                                href={selectedSubmission.tax_document_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Document
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <div className="border rounded-lg p-4">
                            <p className="text-sm font-medium mb-2">Tax Document</p>
                            <p className="text-sm text-gray-500">Not provided</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedSubmission.status === 'pending' && (
                      <div className="flex justify-end gap-4 pt-4">
                        <Button 
                          variant="destructive"
                          onClick={() => updateKYCStatus(selectedSubmission.id, 'rejected')}
                          disabled={processingId === selectedSubmission.id}
                        >
                          {processingId === selectedSubmission.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Reject
                        </Button>
                        <Button 
                          onClick={() => updateKYCStatus(selectedSubmission.id, 'approved')}
                          disabled={processingId === selectedSubmission.id}
                        >
                          {processingId === selectedSubmission.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}