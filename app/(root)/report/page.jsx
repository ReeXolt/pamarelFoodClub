"use client";
import { useState } from 'react';

export default function ReportPage() {
  const [reportData, setReportData] = useState({
    name: '',
    email: '',
    orderId: '',
    product: '',
    issueType: 'product-issue',
    subject: '',
    description: '',
    urgency: 'medium',
    attachments: null
  });
  const [loading, setLoading] = useState(false)

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReportData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setReportData(prevState => ({
      ...prevState,
      attachments: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setReportData({
            name: "",
            email: "",
            orderId: "",
            product: "",
            issueType: "product-issue",
            subject: "",
            description: "",
            urgency: "medium",
            attachments: null,
          });
          setSubmitted(false);
        }, 5000);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Error submitting report.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">Report an Issue</h1>
          <p className="text-gray-600 mt-4">
            Found a problem with a product or service? Let us know and we'll help resolve it.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-6 rounded-lg text-center mb-8">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-bold mb-2">Report Submitted Successfully!</h3>
            <p className="mb-4">Thank you for bringing this to our attention. Our team will review your report and get back to you within 24 hours.</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    value={reportData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={reportData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="orderId" className="block text-gray-700 font-medium mb-2">Order ID (if applicable)</label>
                  <input 
                    type="text" 
                    id="orderId" 
                    name="orderId"
                    value={reportData.orderId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                    placeholder="e.g. ORD-12345"
                  />
                </div>
                <div>
                  <label htmlFor="product" className="block text-gray-700 font-medium mb-2">Product Name</label>
                  <input 
                    type="text" 
                    id="product" 
                    name="product"
                    value={reportData.product}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                    placeholder="Product you're reporting about"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="issueType" className="block text-gray-700 font-medium mb-2">Issue Type *</label>
                  <select 
                    id="issueType" 
                    name="issueType"
                    value={reportData.issueType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                    required
                  >
                    <option value="product-issue">Product Issue</option>
                    <option value="delivery-issue">Delivery Problem</option>
                    <option value="billing-issue">Billing Issue</option>
                    <option value="website-issue">Website Problem</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="urgency" className="block text-gray-700 font-medium mb-2">Urgency Level</label>
                  <select 
                    id="urgency" 
                    name="urgency"
                    value={reportData.urgency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                  >
                    <option value="low">Low - Not urgent</option>
                    <option value="medium">Medium - Standard priority</option>
                    <option value="high">High - Needs quick resolution</option>
                    <option value="critical">Critical - Immediate attention needed</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject *</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject"
                  value={reportData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                  placeholder="Brief summary of the issue"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description *</label>
                <textarea 
                  id="description" 
                  name="description"
                  value={reportData.description}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                  placeholder="Please provide a detailed description of the issue..."
                  required
                ></textarea>
              </div>

              <div className="pt-4">
                <button 
                type="submit"
                disabled={loading}
                className={`w-full font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105
                  ${loading 
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"} 
                `}
              >
                {loading ? "Sending..." : "Report Message"}
              </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}