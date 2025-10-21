import React, { useEffect, useState } from "react";
import Nav from "../Navbar/nav";
import Footer from '../Footer/Footer';
import api from "../../utils/api"; // axios instance with JWT
import "./ordermanager.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_address: "",
    product_id: "",
    size: "",
    quantity: "",
    payment_type: "",
    status: "Packing", 
  });

  // Report filter management
  const now = new Date();
  const [reportType, setReportType] = useState("month");
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);//get the filters as year and monthly wise
  const [selYear, setSelYear] = useState(now.getFullYear());

  
  const getOrderDate = (orderId) => {
    try {
      if (!orderId || typeof orderId !== 'string' || orderId.length < 8) {
        console.warn("Invalid orderId for date parsing:", orderId);
        return new Date();
      }
      
      const hexString = orderId.substring(0, 8);
      const timestamp = parseInt(hexString, 16);
      
      if (isNaN(timestamp) || timestamp <= 0) {
        console.warn("Invalid timestamp parsed from orderId:", hexString, timestamp);
        return new Date();
      }
      
      const date = new Date(timestamp * 1000);
      
      // Validate the date 
      const now = new Date();
      const yearDiff = Math.abs(date.getFullYear() - now.getFullYear());
      
      if (yearDiff > 10) {
        console.warn("Date seems invalid (too far from now):", date, "from orderId:", orderId);
        return new Date();
      }
      
      return date;
    } catch (error) {
      console.error("Error parsing order date:", error, "orderId:", orderId);
      return new Date();
    }
  };

  
  const formatOrderDate = (orderId) => {
    try {
      const date = getOrderDate(orderId);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting order date:", error);
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err.response?.data || err.message);
      alert("Failed to fetch orders. Are you logged in?");
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    //  detect order deletions from refund approvals
    const refreshInterval = setInterval(() => {
      fetchOrders();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  
  const openEditModal = (order) => {
    setEditingOrder(order);
    setFormData({
      customer_name: order.customer_name || "",
      customer_address: order.customer_address || "",
      product_id: order.product_id || "",
      size: order.size || "",
      quantity: order.quantity || "",
      payment_type: order.payment_type || "",
      status: order.status || "Packing",
    });
  };

  const closeModal = () => {
    setEditingOrder(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/orders/${editingOrder._id}`, formData);
      const updatedOrder = res.data.order || formData;
      setOrders((prev) =>
        prev.map((o) => (o._id === editingOrder._id ? { ...o, ...updatedOrder } : o))
      );
      closeModal();
    } catch (err) {
      console.error("Failed to update order:", err.response?.data || err.message);
      alert("Failed to update order");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;
    try {
      await api.delete(`/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("Failed to delete order:", err.response?.data || err.message);
      alert("Failed to delete order");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const orderToUpdate = orders.find((o) => o._id === id);
      const res = await api.put(`/orders/${id}`, {
        ...orderToUpdate,
        status: newStatus,
      });
      const updatedOrder = res.data.order;
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? updatedOrder : o))
      );
    } catch (err) {
      console.error("Failed to update status:", err.response?.data || err.message);
      alert("Failed to update status");
    }
  };

  // Discount statistics and the logic
  const discountStats = orders.reduce((stats, order) => {
    if (order.used_loyalty_points) {
      stats.loyaltyDiscounts += 1;
      stats.loyaltyDiscountAmount += order.loyalty_discount || 0;
    }
    if (order.has_promotion) {
      stats.promotionDiscounts += 1;
      stats.promotionDiscountAmount += order.promotion_discount || 0;
    }
    stats.totalDiscountAmount += (order.loyalty_discount || 0) + (order.promotion_discount || 0);
    return stats;
  }, { 
    loyaltyDiscounts: 0, 
    loyaltyDiscountAmount: 0,
    promotionDiscounts: 0,
    promotionDiscountAmount: 0,
    totalDiscountAmount: 0
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOrders = normalizedQuery
    ? orders.filter((order) => {
        const fields = [
          order._id,
          formatOrderDate(order._id),
          order.customer_name,
          order.customer_address,
          order.product_id,
          order.product_name,
          order.size,
          String(order.quantity),
          order.payment_type,
          order.status,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        return fields.some((f) => f.includes(normalizedQuery));
      })
    : orders;

  // Filter orders by selected month/year
  const filterOrdersByPeriod = (orders, reportType, year, month) => {
    return orders.filter(order => {
      const orderDate = getOrderDate(order._id);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth() + 1; // getMonth() returns 0-11

      if (reportType === "year") {
        return orderYear === year;
      } else {
        return orderYear === year && orderMonth === month;
      }
    });
  };
  //pdf generating part 
  const generatePDF = () => {
    try {
      console.log("Starting PDF generation...");
      console.log("Report type:", reportType, "Year:", selYear, "Month:", selMonth);
      console.log("Total orders:", orders.length);
      
      const isYear = reportType === "year";
      
      // Validate inputs
      if (!orders || !Array.isArray(orders)) {
        console.error("Orders data is not available or invalid");
        alert("No orders data available. Please refresh the page and try again.");
        return;
      }

      if (!selYear || selYear < 1900 || selYear > 3000) {
        console.error("Invalid year:", selYear);
        alert("Please select a valid year.");
        return;
      }

      if (!isYear && (!selMonth || selMonth < 1 || selMonth > 12)) {
        console.error("Invalid month:", selMonth);
        alert("Please select a valid month.");
        return;
      }
      
      // Filter orders by selected period
      const filteredOrders = filterOrdersByPeriod(orders, reportType, selYear, selMonth);
      console.log("Filtered orders count:", filteredOrders.length);

      if (filteredOrders.length === 0) {
        const periodText = isYear ? `year ${selYear}` : `month ${new Date(selYear, selMonth - 1).toLocaleString("default", { month: "long" })} ${selYear}`;
        alert(`No orders found for ${periodText}`);
        return;
      }

      //  PDF creation
      console.log("Creating PDF document...");
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      
      
      doc.setFillColor(31, 41, 55);
      doc.rect(0, 0, pageWidth, 35, "F");
      
      //report heading eka
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text("SNAZZY", 20, 15);
      
      // Report title eka
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text("Orders Report", 20, 22);
      
      // Generation timestamp
      doc.setFontSize(10);
      const generatedDate = new Date();
      doc.text(`Generated: ${generatedDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit' 
      })}`, pageWidth - 80, 15);
      
      // Period indicator
      const monthName = new Date(selYear, selMonth - 1).toLocaleString("default", { month: "long" });
      doc.setFillColor(59, 130, 246);
      doc.setDrawColor(59, 130, 246);
      doc.roundedRect(pageWidth - 60, 20, 45, 12, 3, 3, "FD");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      if (isYear) {
        doc.text(`${selYear}`, pageWidth - 37, 28, { align: "center" });
      } else {
        doc.text(
          `${monthName.slice(0, 3)} ${selYear}`,
          pageWidth - 37,
          28,
          { align: "center" }
        );
      }

      // Calculate highlights
      const totalRevenue = filteredOrders.reduce((sum, order) => {
        const price = parseFloat(order?.total_price) || 0;
        return sum + price;
      }, 0);
      
      const totalDiscounts = filteredOrders.reduce((sum, order) => {
        const promo = parseFloat(order?.promotion_discount) || 0;
        const loyalty = parseFloat(order?.loyalty_discount) || 0;
        return sum + promo + loyalty;
      }, 0);
      
      const statusCounts = filteredOrders.reduce((acc, order) => {
        const status = order?.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      const promotionOrders = filteredOrders.filter(order => order?.has_promotion).length;
      const loyaltyOrders = filteredOrders.filter(order => order?.used_loyalty_points).length;

    
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      let y = 50;
      
      // Report period and title
      doc.text(`Report Period: ${isYear ? `${selYear} (Full Year)` : `${monthName} ${selYear}`}`, 20, y);
      y += 12;
      
      
      const highlightItems = [
        { 
          title: "Total Orders", 
          value: filteredOrders.length.toString(), 
          color: [59, 130, 246]
        },
        { 
          title: "Total Revenue", 
          value: `$${totalRevenue.toFixed(2)}`, 
          color: [34, 197, 94]
        },
        { 
          title: "Total Discounts", 
          value: `$${totalDiscounts.toFixed(2)}`, 
          color: [251, 146, 60]
        },
        { 
          title: "Promotion Orders", 
          value: promotionOrders.toString(), 
          color: [168, 85, 247]
        },
        { 
          title: "Loyalty Orders", 
          value: loyaltyOrders.toString(), 
          color: [251, 191, 36]
        }
      ];


      // Title for highlights section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text("Report Highlights", 20, y);
      y += 20;

      // Create a subtle background for highlights section
      const highlightsBoxHeight = (highlightItems.length * 25) + 20;
      doc.setFillColor(248, 250, 252);
      doc.rect(20, y - 10, pageWidth - 40, highlightsBoxHeight, "F");
      
     
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(3);
      doc.line(20, y - 10, 20, y + highlightsBoxHeight - 10);

      
      highlightItems.forEach((item, index) => {
        const itemY = y + (index * 25);
        
       
        if (index > 0) {
          doc.setDrawColor(229, 231, 235);
          doc.setLineWidth(0.5);
          doc.line(30, itemY - 8, pageWidth - 30, itemY - 8);
        }
        
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(item.title, 35, itemY);
        
        
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(item.color[0], item.color[1], item.color[2]);
        
        
        const valueWidth = doc.getTextWidth(item.value);
        const valueX = (pageWidth - 30) - valueWidth;
        doc.text(item.value, valueX, itemY);
      });

      
      y = y + (highlightItems.length * 25) + 30;

      
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(20, y, pageWidth - 40, 45, 5, 5, "F");
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(20, y, pageWidth - 40, 45, 5, 5, "S");
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text("Order Status Breakdown", 30, y + 15);
      
      // Status badges
      let statusX = 30;
      let statusY = y + 25;
      const statusColors = {
        'Packing': [34, 197, 94],
        'Processing': [34, 197, 94],
        'Delivering': [251, 146, 60],
        'Delivered': [59, 130, 246],
        'Unknown': [107, 114, 128]
      };

      Object.entries(statusCounts).forEach(([status, count]) => {
        const color = statusColors[status] || statusColors['Unknown'];
        
        // Status badge background
        doc.setFillColor(color[0] + 20, color[1] + 20, color[2] + 20);
        doc.roundedRect(statusX, statusY, 55, 12, 2, 2, "F");
        
        // Status badge border
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(statusX, statusY, 55, 12, 2, 2, "S");
        
        // Status text
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(`${status}: ${count}`, statusX + 4, statusY + 8);
        
        statusX += 65;
        if (statusX > pageWidth - 120) {
          statusX = 30;
          statusY += 18;
        }
      });

      y += 55;

      // Orders table
      const tableColumns = [
        "Order ID",
        "Date",
        "Customer",
        "Product",
        "Size",
        "Qty",
        "Base Price",
        "Promo",
        "Loyalty",
        "Total Price",
        "Payment",
        "Status"
      ];

      const tableRows = filteredOrders.map(order => {
        try {
          const orderDateStr = formatOrderDate(order._id || '');
          const datePart = orderDateStr.includes(',') ? orderDateStr.split(',')[0] : orderDateStr;
          
          return [
            (order._id || "—").substring(0, 12) + (order._id && order._id.length > 12 ? "..." : ""),
            datePart || "—",
            (order?.customer_name || "—").substring(0, 15),
            (order?.product_name || "—").substring(0, 20),
            order?.size || "—",
            (order?.quantity || "—").toString(),
            order?.base_price ? `$${parseFloat(order.base_price).toFixed(2)}` : `$${(parseFloat(order?.total_price) || 0).toFixed(2)}`,
            (order?.has_promotion && order?.promotion_discount > 0) ? `-$${parseFloat(order.promotion_discount).toFixed(2)}` : "—",
            (order?.used_loyalty_points && order?.loyalty_discount > 0) ? `-$${parseFloat(order.loyalty_discount).toFixed(2)}` : "—",
            `$${(parseFloat(order?.total_price) || 0).toFixed(2)}`,
            order?.payment_type || "—",
            order?.status || "Packing"
          ];
        } catch (rowError) {
          console.error("Error processing order row:", order, rowError);
          // Return a safe default row
          return [
            "Error",
            "—",
            "—",
            "—",
            "—",
            "—",
            "$0.00",
            "—",
            "—",
            "$0.00",
            "—",
            "Error"
          ];
        }
      });

      console.log("Generating table with", tableRows.length, "rows");

      // Add table title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text("Orders Details", 20, y);
      y += 15;

      // Generate the table with professional styling
      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: y,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
          lineColor: [215, 215, 215],
          lineWidth: 0.5,
          textColor: [45, 55, 72],
          valign: 'middle',
          halign: 'left',
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [31, 41, 55],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          valign: 'middle'
        },
        bodyStyles: {
          fontSize: 8,
          lineColor: [229, 229, 229],
          lineWidth: 0.3
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { 
            cellWidth: 28, 
            halign: 'left',
            fontSize: 7
          },
          1: { 
            cellWidth: 22, 
            halign: 'center',
            fontSize: 8
          },
          2: { 
            cellWidth: 28, 
            halign: 'left' 
          },
          3: { 
            cellWidth: 32, 
            halign: 'left',
            fontSize: 8
          },
          4: { 
            cellWidth: 18, 
            halign: 'center' 
          },
          5: { 
            cellWidth: 18, 
            halign: 'center' 
          },
          6: { 
            cellWidth: 22, 
            halign: 'right',
            fontStyle: 'bold'
          },
          7: { 
            cellWidth: 20, 
            halign: 'right' 
          },
          8: { 
            cellWidth: 20, 
            halign: 'right' 
          },
          9: { 
            cellWidth: 22, 
            halign: 'right',
            fontStyle: 'bold',
            textColor: [34, 197, 94]
          },
          10: { 
            cellWidth: 20, 
            halign: 'center' 
          },
          11: { 
            cellWidth: 22, 
            halign: 'center',
            fontSize: 7
          }
        },
        margin: { left: 20, right: 20 },
        pageBreak: 'auto',
        showHead: 'everyPage',
        didDrawPage: (data) => {
          try {
            // page numbers
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
            doc.text(`Page ${pageNum}`, pageWidth - 40, doc.internal.pageSize.height - 15);
          } catch (pageError) {
            console.error("Error adding page number:", pageError);
          }
        },
        didParseCell: (data) => {
          // status column eka
          if (data.column.index === 11) { // Status column
            const status = data.cell.text[0];
            const statusColors = {
              'Packing': [251, 146, 60],
              'Processing': [251, 146, 60],
              'Delivering': [59, 130, 246],
              'Delivered': [34, 197, 94]
            };
            const color = statusColors[status] || [107, 114, 128];
            data.cell.styles.textColor = color;
            data.cell.styles.fontStyle = 'bold';
          }
          
          // price column eka
          if ([6, 7, 8, 9].includes(data.column.index)) {
            if (data.cell.text[0] && data.cell.text[0].startsWith('$')) {
              data.cell.styles.fontStyle = 'normal';
            }
          }
        }
      });

      console.log("Table generated successfully");

      // summary at the bottom 
      try {
        let finalY = 180; // Default position if we can't get the table end position
        if (doc.previousAutoTable && typeof doc.previousAutoTable.finalY === 'number') {
          finalY = doc.previousAutoTable.finalY + 20;
        }

        if (finalY < 150) {
          doc.setDrawColor(200, 200, 200);
          doc.line(20, finalY, pageWidth - 20, finalY);
          
          doc.setFontSize(10);
          doc.setTextColor(31, 41, 55);
          doc.setFont('helvetica', 'bold');
          
          doc.text(`Status Summary:`, 20, finalY + 10);
          doc.setFont('helvetica', 'normal');
          
          let statusY = finalY + 20;
          Object.entries(statusCounts).forEach(([status, count]) => {
            doc.text(`${status}: ${count} orders`, 20, statusY);
            statusY += 10;
          });
        }
      } catch (summaryError) {
        console.error("Error adding summary:", summaryError);
        
      }

      // Generate filename and save
      const periodStr = isYear ? selYear.toString() : `${selYear}_${selMonth.toString().padStart(2, '0')}`;
      const filename = `Orders_Report_${periodStr}.pdf`;
      
      console.log("Saving PDF with filename:", filename);
      doc.save(filename);
      console.log("PDF generation completed successfully");

    } catch (err) {
      console.error("Orders report generation failed", err);
      console.error("Error stack:", err.stack);
      alert(`Failed to generate orders report: ${err.message}`);
    }
  };

  return (
    <div>
      <Nav />
      <div className="om-container">
        <div className="om-header">
          <h2 className="om-title">Order Manager Dashboard</h2>
          
          {/* Search Bar */}
          <div className="om-search">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, customer, product, status..."
              aria-label="Search orders"
            />
          </div>

          {/* Report Filters - Linear Layout */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "12px",
            flexWrap: "wrap"
          }}>
            <select
              style={{
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                color: "#111827",
                fontSize: "0.9rem",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                minWidth: "120px",
                height: "40px"
              }}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>

            {reportType === "month" && (
              <>
                <select
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    color: "#111827",
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    minWidth: "120px",
                    height: "40px"
                  }}
                  value={selMonth}
                  onChange={(e) => setSelMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {new Date(2000, idx).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>

                <input
                  style={{
                    padding: "8px 12px",
                    width: "90px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    color: "#111827",
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    height: "40px"
                  }}
                  type="number"
                  value={selYear}
                  onChange={(e) => setSelYear(Number(e.target.value))}
                  min="2020"
                  max="2030"
                />
              </>
            )}

            {reportType === "year" && (
              <input
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  minWidth: "100px",
                  height: "40px"
                }}
                type="number"
                value={selYear}
                onChange={(e) => setSelYear(Number(e.target.value))}
                min="2020"
                max="2030"
              />
            )}

            <button
              className="btn btn-primary"
              onClick={generatePDF}
              style={{
                padding: "8px 20px",
                height: "40px",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "500",
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                border: "none",
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              Generate Orders Report (PDF)
            </button>
          </div>
        </div>

        {orders.length > 0 && (
          <div className="om-stats">
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Total Orders</div>
                <div className="om-stat-value">{orders.length}</div>
              </div>
              <div className="om-stat-icon">📋</div>
            </div>
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Promotion Discounts</div>
                <div className="om-stat-value om-danger">{discountStats.promotionDiscounts}</div>
              </div>
              <div className="om-stat-icon">🎯</div>
            </div>
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Loyalty Discounts</div>
                <div className="om-stat-value om-warn">{discountStats.loyaltyDiscounts}</div>
              </div>
              <div className="om-stat-icon">⭐</div>
            </div>
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Total Discounts Given</div>
                <div className="om-stat-value om-success">${discountStats.totalDiscountAmount.toFixed(2)}</div>
              </div>
              <div className="om-stat-icon">💰</div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="orders-section">
          <div className="orders-header">
            <h2 className="orders-title">Orders Management</h2>
            <div className="orders-info">
              <span className="orders-count">
                {filteredOrders.length} of {orders.length} orders
              </span>
            </div>
          </div>

          {filteredOrders.length > 0 ? (
            <div className="om-table-container">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Order Placed Date</th>
                    <th>Customer Name</th>
                    <th>Address</th>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Size</th>
                    <th>Quantity</th>
                    <th>Base Price</th>
                    <th>Promotion Discount</th>
                    <th>Loyalty Discount</th>
                    <th>Total Price</th>
                    <th>Payment Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="om-mono">{order._id}</td>
                      <td className="om-date">{formatOrderDate(order._id)}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.customer_address}</td>
                      <td className="om-mono">{order.product_id}</td>
                      <td>{order.product_name}</td>
                      <td>{order.size}</td>
                      <td>{order.quantity}</td>
                      <td>
                        {order.base_price ? `$${order.base_price.toFixed(2)}` : `$${order.total_price.toFixed(2)}`}
                      </td>
                      <td>
                        {order.has_promotion && order.promotion_discount > 0 ? (
                          <div> 
                            <span className="om-badge om-danger">-{order.promotion_discount.toFixed(2)}</span>
                            <div className="om-subtext">{order.promotion_title || "Promotion"}</div>
                          </div>
                        ) : (
                          <span className="om-subtext">No promotion</span>
                        )}
                      </td>
                      <td>
                        {order.used_loyalty_points && order.loyalty_discount > 0 ? (
                          <span className="om-badge om-warn">-{order.loyalty_discount.toFixed(2)}</span>
                        ) : (
                          <span className="om-subtext">No loyalty discount</span>
                        )}
                      </td>
                      <td>
                        <span className={`om-price ${order.used_loyalty_points || order.has_promotion ? "om-warn" : ""}`}>
                          ${order.total_price.toFixed(2)}
                        </span>
                        {(order.used_loyalty_points || order.has_promotion) && (
                          <div className="om-subtext">
                            {order.has_promotion && order.used_loyalty_points
                              ? "Promotion + Loyalty"
                              : order.has_promotion
                              ? "Promotion Applied"
                              : "Loyalty Points Used"}
                          </div>
                        )}
                      </td>
                      <td>{order.payment_type}</td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status || "Packing"}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          <option value="Packing">Processing</option>
                          <option value="Delivering">Delivering</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-edit" onClick={() => openEditModal(order)}>Edit</button>
                        <button className="btn btn-delete" onClick={() => handleDelete(order._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state-container">
              <p className="empty-state">{orders.length > 0 ? "No orders match your search." : "No orders found"}</p>
            </div>
          )}
        </div>

        {editingOrder && (
          <div className="om-modal-backdrop" onClick={closeModal}>
            <div className="om-modal" onClick={(e) => e.stopPropagation()}>
              <button className="om-modal-close" onClick={closeModal}>
                ×
              </button>
              <h3>Edit Order</h3>

              {(editingOrder.used_loyalty_points || editingOrder.has_promotion) && (
                <div className="om-discount-card">
                  <div className="om-discount-title"> Discounts Applied</div>
                  <div className="om-subtext">
                    Base Price: ${editingOrder.base_price?.toFixed(2) || editingOrder.total_price.toFixed(2)}<br />
                    {editingOrder.has_promotion && (
                      <>
                        Promotion Discount: -${editingOrder.promotion_discount?.toFixed(2) || "0.00"} ({editingOrder.promotion_title || "Promotion"})<br />
                      </>
                    )}
                    {editingOrder.used_loyalty_points && (
                      <>
                        Loyalty Points Discount: -${editingOrder.loyalty_discount?.toFixed(2) || "0.00"}<br />
                      </>
                    )}
                    Final Price: ${editingOrder.total_price.toFixed(2)}
                  </div>
                </div>
              )}

              <form onSubmit={handleUpdate} className="om-form">
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="Customer Name"
                  required
                  readOnly
                />
                <input
                  type="text"
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleChange}
                  placeholder="Address"
                  required
                />
                <input
                  type="text"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  placeholder="Product ID"
                  required
                  readOnly
                />
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="Size"
                  required
                />
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Quantity"
                  required
                  readOnly
                />
                <input
                  type="text"
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleChange}
                  placeholder="Payment Type"
                  required
                  readOnly
                />
                <select name="status" value={formData.status} onChange={handleChange} className="status-select">
                  <option value="Packing">Processing</option>
                  <option value="Delivering">Delivering</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <div className="om-form-actions">
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" className="btn btn-secondarye" onClick={closeModal}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
      <Footer/>
    </div>
  );
}

export default OrderManager;
