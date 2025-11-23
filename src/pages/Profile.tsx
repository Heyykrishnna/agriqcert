import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Upload, Trash2, Download, LogOut, Shield, Lock, Share2, Calendar, AlertTriangle, Copy, Clock, Archive, Tags, Filter, Search, CheckSquare, FolderArchive } from "lucide-react";
import FloatingParticles from "@/components/FloatingParticles";
import gsap from "gsap";
import { Link } from "react-router-dom";

type DocumentType = "aadhar" | "pan" | "passport" | "driving_license" | "bank_statement" | "certificate" | "other";

interface ProfileDocument {
  id: string;
  document_type: DocumentType;
  document_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  expiry_date: string | null;
  shared_link_token: string | null;
  shared_with_email: string | null;
  share_expires_at: string | null;
}

const documentTypeLabels: Record<DocumentType, string> = {
  aadhar: "Aadhar Card",
  pan: "PAN Card",
  passport: "Passport",
  driving_license: "Driving License",
  bank_statement: "Bank Statement",
  certificate: "Certificate",
  other: "Other Document",
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>("other");
  const [documentName, setDocumentName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocForShare, setSelectedDocForShare] = useState<ProfileDocument | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareDays, setShareDays] = useState("7");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<DocumentType | "all">("all");
  const [newTag, setNewTag] = useState("");
  const [documentTags, setDocumentTags] = useState<Record<string, string[]>>({});
  
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
    fetchDocumentTags();
  }, [user]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
      });
      
      gsap.from(cardRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: "power3.out"
      });
    });

    return () => ctx.revert();
  }, []);

  const fetchDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profile_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments((data || []) as ProfileDocument[]);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentTags = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("document_tags")
        .select("document_id, tag_name");

      if (error) throw error;
      
      const tagMap: Record<string, string[]> = {};
      data?.forEach((tag: any) => {
        if (!tagMap[tag.document_id]) {
          tagMap[tag.document_id] = [];
        }
        tagMap[tag.document_id].push(tag.tag_name);
      });
      setDocumentTags(tagMap);
    } catch (error: any) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
      return;
    }

    if (!documentName.trim()) {
      toast.error("Please enter a document name");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("profile_documents")
        .insert({
          user_id: user.id,
          document_type: selectedType,
          document_name: documentName,
          file_url: fileName,
          file_size: file.size,
          mime_type: file.type,
          expiry_date: expiryDate || null,
        });

      if (dbError) throw dbError;

      toast.success("Document uploaded successfully");
      setDocumentName("");
      setExpiryDate("");
      fetchDocuments();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("profile-documents")
        .remove([fileUrl]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("profile_documents")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast.success("Document deleted successfully");
      fetchDocuments();
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const handleDownload = async (fileUrl: string, documentName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("profile-documents")
        .download(fileUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  const handleShareDocument = async () => {
    if (!selectedDocForShare || !user) return;

    if (!shareEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      const shareToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(shareDays));

      const { error } = await supabase
        .from("profile_documents")
        .update({
          shared_link_token: shareToken,
          shared_with_email: shareEmail,
          share_expires_at: expiresAt.toISOString(),
          share_created_at: new Date().toISOString(),
        })
        .eq("id", selectedDocForShare.id);

      if (error) throw error;

      const shareUrl = `${window.location.origin}/shared-document/${shareToken}`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
      
      setShareDialogOpen(false);
      setShareEmail("");
      setSelectedDocForShare(null);
      fetchDocuments();
    } catch (error: any) {
      console.error("Error sharing document:", error);
      toast.error("Failed to create share link");
    }
  };

  const handleRevokeShare = async (id: string) => {
    try {
      const { error } = await supabase
        .from("profile_documents")
        .update({
          shared_link_token: null,
          shared_with_email: null,
          share_expires_at: null,
          share_created_at: null,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Share link revoked");
      fetchDocuments();
    } catch (error: any) {
      console.error("Error revoking share:", error);
      toast.error("Failed to revoke share link");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    
    const daysLeft = getDaysUntilExpiry(expiryDate);
    
    if (daysLeft < 0) return { text: "Expired", color: "text-red-400", bg: "bg-red-500/20" };
    if (daysLeft <= 7) return { text: `${daysLeft}d left`, color: "text-orange-400", bg: "bg-orange-500/20" };
    if (daysLeft <= 30) return { text: `${daysLeft}d left`, color: "text-yellow-400", bg: "bg-yellow-500/20" };
    return { text: `${daysLeft}d left`, color: "text-green-400", bg: "bg-green-500/20" };
  };

  const handleAddTag = async (docId: string) => {
    if (!newTag.trim()) return;

    try {
      const { error } = await supabase
        .from("document_tags")
        .insert({ document_id: docId, tag_name: newTag.trim().toLowerCase() });

      if (error) throw error;
      toast.success("Tag added");
      setNewTag("");
      fetchDocumentTags();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error("Tag already exists");
      } else {
        toast.error("Failed to add tag");
      }
    }
  };

  const handleRemoveTag = async (docId: string, tagName: string) => {
    try {
      const { error } = await supabase
        .from("document_tags")
        .delete()
        .eq("document_id", docId)
        .eq("tag_name", tagName);

      if (error) throw error;
      toast.success("Tag removed");
      fetchDocumentTags();
    } catch (error: any) {
      toast.error("Failed to remove tag");
    }
  };

  const handleBulkExport = async () => {
    if (selectedDocs.size === 0) {
      toast.error("No documents selected");
      return;
    }

    toast.info("Preparing documents for download...");
    
    for (const docId of selectedDocs) {
      const doc = documents.find(d => d.id === docId);
      if (doc) {
        await handleDownload(doc.file_url, doc.document_name);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setSelectedDocs(new Set());
    toast.success("Documents downloaded");
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDocs.size === filteredDocuments.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredDocuments.map(d => d.id)));
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.document_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || doc.document_type === filterType;
    const matchesTags = !searchQuery || (documentTags[doc.id]?.some(tag => 
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    ));
    
    return (matchesSearch || matchesTags) && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1a1f35] to-[#0A0F1C] relative overflow-hidden">
      <FloatingParticles />
      
      <header ref={headerRef} className="border-b border-gray-800 bg-[#1a1f35]/50 backdrop-blur-xl relative z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#10b981]/20">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">My Profile</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-gray-300 hover:text-white hover:bg-[#10b981]/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Document Vault
          </h2>
          <p className="text-gray-400 text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Securely store and manage your important documents
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <Card ref={cardRef} className="bg-gradient-to-br from-[#1a1f35] to-[#0f1420] border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Upload className="h-6 w-6 text-[#10b981]" />
                Upload Document
              </CardTitle>
              <CardDescription className="text-gray-400">
                Store your important documents securely with expiry tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-type" className="text-gray-300">Document Type</Label>
                <Select value={selectedType} onValueChange={(value) => setSelectedType(value as DocumentType)}>
                  <SelectTrigger id="document-type" className="bg-[#0A0F1C] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f35] border-gray-700">
                    {Object.entries(documentTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-[#10b981]/20">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-name" className="text-gray-300">Document Name</Label>
                <Input
                  id="document-name"
                  type="text"
                  placeholder="E.g., My Passport"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="bg-[#0A0F1C] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#10b981]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry-date" className="text-gray-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expiry Date (Optional)
                </Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="bg-[#0A0F1C] border-gray-700 text-white focus:border-[#10b981]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-gray-300">Select File (Max 20MB)</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="bg-[#0A0F1C] border-gray-700 text-white file:bg-[#10b981] file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-lg cursor-pointer"
                />
              </div>

              {uploading && (
                <div className="text-center text-[#10b981] py-2">
                  Uploading...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card className="bg-gradient-to-br from-[#1a1f35] to-[#0f1420] border-gray-700 shadow-xl lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    <FileText className="h-6 w-6 text-[#10b981]" />
                    My Documents
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} 
                    {selectedDocs.size > 0 && ` (${selectedDocs.size} selected)`}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedDocs.size > 0 && (
                    <Button
                      size="sm"
                      onClick={handleBulkExport}
                      className="bg-[#10b981] hover:bg-[#059669]"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Export Selected ({selectedDocs.size})
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleSelectAll}
                    className="border-gray-600"
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    {selectedDocs.size === filteredDocuments.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#0A0F1C] border-gray-700 text-white"
                  />
                </div>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as DocumentType | "all")}>
                  <SelectTrigger className="bg-[#0A0F1C] border-gray-700 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f35] border-gray-700">
                    <SelectItem value="all" className="text-white">All Types</SelectItem>
                    {Object.entries(documentTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-white">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading...</div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>{documents.length === 0 ? "No documents uploaded yet" : "No documents match your search"}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredDocuments.map((doc) => {
                    const expiryStatus = getExpiryStatus(doc.expiry_date);
                    const tags = documentTags[doc.id] || [];
                    return (
                      <div
                        key={doc.id}
                        className={`bg-[#0A0F1C] border rounded-lg p-4 transition-all ${
                          selectedDocs.has(doc.id) ? 'border-[#10b981] ring-2 ring-[#10b981]/20' : 'border-gray-700 hover:border-[#10b981]/50'
                        }`}
                      >
                        <div className="flex items-start gap-4 mb-3">
                          <input
                            type="checkbox"
                            checked={selectedDocs.has(doc.id)}
                            onChange={() => toggleDocSelection(doc.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-600 text-[#10b981] focus:ring-[#10b981]"
                          />
                          <div className="flex-grow">
                            <h4 className="text-white font-semibold mb-1">{doc.document_name}</h4>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-2">
                              <span className="bg-[#10b981]/20 text-[#10b981] px-2 py-1 rounded">
                                {documentTypeLabels[doc.document_type]}
                              </span>
                              <span>{formatFileSize(doc.file_size)}</span>
                              <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                            </div>
                            
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs"
                                  >
                                    <Tags className="h-3 w-3" />
                                    {tag}
                                    <button
                                      onClick={() => handleRemoveTag(doc.id, tag)}
                                      className="hover:text-white"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Add tag..."
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddTag(doc.id);
                                  }
                                }}
                                className="h-7 text-xs bg-[#1a1f35] border-gray-600"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAddTag(doc.id)}
                                variant="ghost"
                                className="h-7 px-2"
                              >
                                <Tags className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {expiryStatus && (
                          <div className={`flex items-center gap-2 mb-3 text-xs px-3 py-2 rounded ${expiryStatus.bg}`}>
                            <AlertTriangle className={`h-4 w-4 ${expiryStatus.color}`} />
                            <span className={expiryStatus.color}>
                              {expiryStatus.text} - Expires {new Date(doc.expiry_date!).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {doc.shared_link_token && (
                          <div className="flex items-center gap-2 mb-3 text-xs px-3 py-2 rounded bg-blue-500/20">
                            <Share2 className="h-4 w-4 text-blue-400" />
                            <span className="text-blue-400">
                              Shared with {doc.shared_with_email} - Expires{" "}
                              {new Date(doc.share_expires_at!).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(doc.file_url, doc.document_name)}
                            className="text-[#3b82f6] hover:text-white hover:bg-[#3b82f6]/20"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          {doc.shared_link_token ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRevokeShare(doc.id)}
                              className="text-orange-400 hover:text-white hover:bg-orange-500/20"
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Revoke
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedDocForShare(doc);
                                setShareDialogOpen(true);
                              }}
                              className="text-[#10b981] hover:text-white hover:bg-[#10b981]/20"
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(doc.id, doc.file_url)}
                            className="text-red-400 hover:text-white hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="mt-6 bg-gradient-to-r from-[#10b981]/10 to-[#059669]/10 border-[#10b981]/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-[#10b981] mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-1">Your documents are secure</h4>
                <p className="text-gray-400 text-sm">
                  All documents are encrypted and stored securely. Only you can access your documents.
                  Share links are temporary and can be revoked anytime. Expiry notifications help you stay updated.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-[#1a1f35] border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#10b981]" />
              Share Document
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a secure, temporary link to share "{selectedDocForShare?.document_name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="share-email" className="text-gray-300">Share with Email</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="recipient@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="bg-[#0A0F1C] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#10b981]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-days" className="text-gray-300">Link expires in</Label>
              <Select value={shareDays} onValueChange={setShareDays}>
                <SelectTrigger id="share-days" className="bg-[#0A0F1C] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f35] border-gray-700">
                  <SelectItem value="1" className="text-white hover:bg-[#10b981]/20">1 day</SelectItem>
                  <SelectItem value="7" className="text-white hover:bg-[#10b981]/20">7 days</SelectItem>
                  <SelectItem value="30" className="text-white hover:bg-[#10b981]/20">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleShareDocument}
              className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white"
            >
              <Copy className="h-4 w-4 mr-2" />
              Create & Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
