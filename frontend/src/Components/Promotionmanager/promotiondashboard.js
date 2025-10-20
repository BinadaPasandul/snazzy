import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../Navbar/nav';
import Footer from '../Footer/Footer';
import api from '../../utils/api';
import './promotionmanager.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function PromotionDashboard() {
    const [promotions, setPromotions] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPromotions, setFilteredPromotions] = useState([]);
    const navigate = useNavigate();

    // Report generation state
    const now = new Date();
    const [reportType, setReportType] = useState("month");
    const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
    const [selYear, setSelYear] = useState(now.getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [promotionsRes, productsRes, ordersRes] = await Promise.all([
                    api.get('/Promotions'),
                    api.get('/products'),
                    api.get('/orders')
                ]);
                
                const promos = promotionsRes.data.promotions || [];
                const prods = productsRes.data.products || [];
                const orderData = ordersRes.data.orders || [];
                
                setPromotions(promos);
                setProducts(prods);
                setOrders(orderData);
                setFilteredPromotions(promos);
            } catch (err) {
                setError(err?.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        }; 
        fetchData();
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPromotions(promotions);
        } else {
            const filtered = promotions.filter(promotion => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    promotion.title.toLowerCase().includes(searchLower) ||
                    promotion.description?.toLowerCase().includes(searchLower) ||
                    promotion.productId.toLowerCase().includes(searchLower) ||
                    promotion.discount.toString().includes(searchTerm) ||
                    (promotion.startDate && new Date(promotion.startDate).toLocaleDateString().includes(searchTerm)) ||
                    (promotion.endDate && new Date(promotion.endDate).toLocaleDateString().includes(searchTerm))
                );
            });
            setFilteredPromotions(filtered);
        }
    }, [searchTerm, promotions]);

    const refresh = async () => {
        try {
            const [promotionsRes, productsRes, ordersRes] = await Promise.all([
                api.get('/Promotions'),
                api.get('/products'),
                api.get('/orders')
            ]);
            
            const promos = promotionsRes.data.promotions || [];
            const prods = productsRes.data.products || [];
            const orderData = ordersRes.data.orders || [];
            
            setPromotions(promos);
            setProducts(prods);
            setOrders(orderData);
            setFilteredPromotions(promos);
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        }
    };

    const getProductByCode = (productCode) => {
        return products.find(product => product.pcode === productCode);
    };

    const getPromotionPerformance = (promotion) => {
        const product = getProductByCode(promotion.productId);
        const promotionOrders = orders.filter(order => 
            order.has_promotion && order.promotion_id === promotion._id
        );
        
        const orderCount = promotionOrders.length;
        const totalRevenue = promotionOrders.reduce((sum, order) => sum + order.total_price, 0);
        const totalDiscountGiven = promotionOrders.reduce((sum, order) => sum + (order.promotion_discount || 0), 0);
        
        const totalProductOrders = orders.filter(order => order.product_id === promotion.productId).length;
        const conversionRate = totalProductOrders > 0 ? (orderCount / totalProductOrders) * 100 : 0;
        const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
        
        return {
            orderCount,
            totalRevenue,
            totalDiscountGiven,
            conversionRate,
            avgOrderValue,
            totalProductOrders
        };
    };

    const handleDelete = async (promotionId) => {
        const confirmed = window.confirm('Are you sure you want to delete this promotion?');
        if (!confirmed) return;
        try {
            await api.delete(`/Promotions/${promotionId}`);
            await refresh();
            alert('Promotion deleted');
        } catch (err) {
            alert(`Failed to delete: ${err?.response?.data?.message || err.message}`);
        }
    };

    const handleEdit = (promotion) => {
        navigate(`/EditPromotion/${promotion._id}`);
    };

    // Filter promotions by selected month/year
    const filterPromotionsByPeriod = (promotions, reportType, year, month) => {
        return promotions.filter(promotion => {
            const startDate = new Date(promotion.startDate);
            const endDate = new Date(promotion.endDate);
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth() + 1;
            const endYear = endDate.getFullYear();
            const endMonth = endDate.getMonth() + 1;

            if (reportType === "year") {
                // Check if promotion was active during the selected year
                return (startYear <= year && endYear >= year);
            } else {
                // Check if promotion was active during the selected month/year
                return (startYear < year || (startYear === year && startMonth <= month)) &&
                       (endYear > year || (endYear === year && endMonth >= month));
            }
        });
    };

    const generatePDF = () => {
        try {
            console.log("Starting PDF generation...");
            console.log("Report type:", reportType, "Year:", selYear, "Month:", selMonth);
            console.log("Total promotions:", promotions.length);
            
            const isYear = reportType === "year";
            
            // Validate inputs
            if (!promotions || !Array.isArray(promotions)) {
                console.error("Promotions data is not available or invalid");
                alert("No promotions data available. Please refresh the page and try again.");
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
            
            // Filter promotions by selected period
            const filteredPromotions = filterPromotionsByPeriod(promotions, reportType, selYear, selMonth);
            console.log("Filtered promotions count:", filteredPromotions.length);

            if (filteredPromotions.length === 0) {
                const periodText = isYear ? `year ${selYear}` : `month ${new Date(selYear, selMonth - 1).toLocaleString("default", { month: "long" })} ${selYear}`;
                alert(`No promotions found for ${periodText}`);
                return;
            }

            // Create professional PDF
            console.log("Creating PDF document...");
            const doc = new jsPDF('landscape', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.width;
            
            // Professional Header
            doc.setFillColor(31, 41, 55);
            doc.rect(0, 0, pageWidth, 35, "F");
            
            // Company title
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text("SNAZZY", 20, 15);
            
            // Report title
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text("Promotion Management Report", 20, 22);
            
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
            
            // Period indicator badge
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

            // Continue with the rest of the PDF generation
            generatePDFContent(doc, new Date().toLocaleDateString(), filteredPromotions, isYear, selYear, selMonth, monthName);

        } catch (err) {
            console.error("Promotion report generation failed", err);
            console.error("Error stack:", err.stack);
            alert(`Failed to generate promotion report: ${err.message}`);
        }
    };

    // Separate function for PDF content generation
    const generatePDFContent = (doc, currentDate, filteredPromotions, isYear, selYear, selMonth, monthName) => {
        
        // Calculate summary statistics for filtered promotions
        const totalPromotionOrders = orders.filter(order => order.has_promotion).length;
        const totalOrders = orders.length;
        const overallConversionRate = totalOrders > 0 ? (totalPromotionOrders / totalOrders) * 100 : 0;
        const totalPromotionRevenue = orders
            .filter(order => order.has_promotion)
            .reduce((sum, order) => sum + order.total_price, 0);
        const totalDiscountGiven = orders
            .filter(order => order.has_promotion)
            .reduce((sum, order) => sum + (order.promotion_discount || 0), 0);

        // Calculate promotion-specific metrics
        const activePromotions = filteredPromotions.filter(p => {
            const now = new Date();
            const startDate = new Date(p.startDate);
            const endDate = new Date(p.endDate);
            return now >= startDate && now <= endDate;
        }).length;

        const upcomingPromotions = filteredPromotions.filter(p => {
            const now = new Date();
            const startDate = new Date(p.startDate);
            return startDate > now;
        }).length;

        const expiredPromotions = filteredPromotions.filter(p => {
            const now = new Date();
            const endDate = new Date(p.endDate);
            return endDate < now;
        }).length;

        // Report Overview Section
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        let y = 50;
        
        // Report period and title
        doc.text(`Report Period: ${isYear ? `${selYear} (Full Year)` : `${monthName} ${selYear}`}`, 20, y);
        y += 15;
        
        // Summary Statistics Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Summary Statistics', 20, y);
        y += 20;
        
        // Display metrics in simple black and white format
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        doc.text(`Total Promotions: ${filteredPromotions.length}`, 20, y);
        y += 15;
        
        doc.text(`Active Promotions: ${activePromotions}`, 20, y);
        y += 15;
        
        doc.text(`Upcoming Promotions: ${upcomingPromotions}`, 20, y);
        y += 15;
        
        doc.text(`Expired Promotions: ${expiredPromotions}`, 20, y);
        y += 15;
        
        doc.text(`Total Promotion Orders: ${totalPromotionOrders}`, 20, y);
        y += 15;
        
        doc.text(`Overall Conversion Rate: ${overallConversionRate.toFixed(1)}%`, 20, y);
        y += 15;
        
        doc.text(`Total Promotion Revenue: $${totalPromotionRevenue.toFixed(2)}`, 20, y);
        y += 15;
        
        doc.text(`Total Discounts Given: $${totalDiscountGiven.toFixed(2)}`, 20, y);
        y += 25;

        // Prepare data for the table
        const tableData = filteredPromotions.map(promotion => {
            const product = getProductByCode(promotion.productId);
            const performance = getPromotionPerformance(promotion);
            const originalPrice = product ? product.pamount : 0;
            const discountedPrice = originalPrice - (originalPrice * promotion.discount / 100);
            
            return [
                promotion.title || 'N/A',
                product ? product.pname : 'Product Not Found',
                promotion.productId,
                `${promotion.discount}%`,
                `$${originalPrice.toFixed(2)}`,
                `$${discountedPrice.toFixed(2)}`,
                promotion.startDate ? new Date(promotion.startDate).toLocaleDateString() : 'N/A',
                promotion.endDate ? new Date(promotion.endDate).toLocaleDateString() : 'N/A',
                performance.orderCount.toString(),
                `${performance.conversionRate.toFixed(1)}%`,
                `$${performance.totalRevenue.toFixed(2)}`,
                `$${performance.avgOrderValue.toFixed(2)}`
            ];
        });
        
        // Add promotions table
        doc.setFontSize(14);
        doc.text('Promotions Details', 20, y);
        y += 15;

        // Generate the table with professional styling
        autoTable(doc, {
            head: [['Title', 'Product', 'Code', 'Discount', 'Original Price', 'Discounted Price', 'Start Date', 'End Date', 'Orders', 'Conversion', 'Revenue', 'Avg Order']],
            body: tableData,
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
                0: { cellWidth: 25 },
                1: { cellWidth: 20 },
                2: { cellWidth: 15 },
                3: { cellWidth: 12 },
                4: { cellWidth: 15 },
                5: { cellWidth: 15 },
                6: { cellWidth: 15 },
                7: { cellWidth: 15 },
                8: { cellWidth: 12 },
                9: { cellWidth: 12 },
                10: { cellWidth: 15 },
                11: { cellWidth: 15 }
            },
            margin: { left: 20, right: 20 },
            pageBreak: 'auto',
            showHead: 'everyPage',
            didDrawPage: (data) => {
                try {
                    // Add page numbers with better styling
                    doc.setFontSize(8);
                    doc.setTextColor(128, 128, 128);
                    const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
                    doc.text(`Page ${pageNum}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 15);
                } catch (pageError) {
                    console.error("Error adding page number:", pageError);
                }
            }
        });

        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
            doc.text('Snazzy Promotion Dashboard Report', doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 10);
        }
        
        // Save the PDF
        const periodStr = isYear ? selYear.toString() : `${selYear}_${selMonth.toString().padStart(2, '0')}`;
        const filename = `Promotion_Report_${periodStr}.pdf`;
        doc.save(filename);
    };

    return (
        <>
            <Nav />

            <div className="promotion-dashboard5">
                <div className="promotion-header5">
                    <div className="promotion-header-content5">
                        <h1 className="promotion-title15">Promotion Manager Dashboard</h1>
                        <p className="promotion-subtitle5">Manage your promotional campaigns and track performance</p>
                    </div>
                    <div className="promotion-actions5">
                        <button 
                            className="add-promotion-btn5"
                            onClick={() => navigate('/insertpromotion')} 
                        >
                            Add Promotion
                        </button>
                    </div>
                </div>

                {/* Search Section */}
                <div className="promotion-search5">
                    <div className="promotion-search-header5">
                        <h3 className="promotion-search-title5">Search Promotions</h3>
                        <div className="promotion-search-info5">
                            {searchTerm && (
                                <span className="search-results5">
                                    Showing {filteredPromotions.length} of {promotions.length} promotions
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="promotion-search-container5">
                        <div className="search-input-wrapper5">
                            <input
                                type="text"
                                className="promotion-search-input5"
                                placeholder="Search promotions by title, description, product ID, discount, or date..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="promotion-search-icon5">🔍</div>
                            {searchTerm && (
                                <button
                                    className="promotion-search-clear5"
                                    onClick={() => setSearchTerm('')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report Filters */}
                <div className="promotion-report-filters5">
                    <div className="promotion-report-header5">
                        <h3 className="promotion-report-title5">Generate Report</h3>
                        <div className="promotion-report-info5">
                            <span className="report-info5">
                                Select period for detailed promotion analysis
                            </span>
                        </div>
                    </div>
                    <div className="promotion-report-controls5">
                        <div className="report-filter-group5">
                            <label className="report-filter-label5">Report Type:</label>
                            <select
                                className="report-filter-select5"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="month">Monthly</option>
                                <option value="year">Yearly</option>
                            </select>
                        </div>

                        {reportType === "month" && (
                            <>
                                <div className="report-filter-group5">
                                    <label className="report-filter-label5">Month:</label>
                                    <select
                                        className="report-filter-select5"
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
                                </div>

                                <div className="report-filter-group5">
                                    <label className="report-filter-label5">Year:</label>
                                    <input
                                        className="report-filter-input5"
                                        type="number"
                                        value={selYear}
                                        onChange={(e) => setSelYear(Number(e.target.value))}
                                        min="2020"
                                        max="2030"
                                    />
                                </div>
                            </>
                        )}

                        {reportType === "year" && (
                            <div className="report-filter-group5">
                                <label className="report-filter-label5">Year:</label>
                                <input
                                    className="report-filter-input5"
                                    type="number"
                                    value={selYear}
                                    onChange={(e) => setSelYear(Number(e.target.value))}
                                    min="2020"
                                    max="2030"
                                />
                            </div>
                        )}

                        <button
                            className="promotion-pdf-export-btn5"
                            onClick={generatePDF}
                            disabled={loading || promotions.length === 0}
                        >
                            📄 Export PDF Report
                        </button>
                    </div>
                </div>

                {/* Promotion Performance Summary */}
                {!loading && promotions.length > 0 && (
                    <div className="promotion-stats5">
                        {(() => {
                            const totalPromotionOrders = orders.filter(order => order.has_promotion).length;
                            const totalOrders = orders.length;
                            const overallConversionRate = totalOrders > 0 ? (totalPromotionOrders / totalOrders) * 100 : 0;
                            const totalPromotionRevenue = orders
                                .filter(order => order.has_promotion)
                                .reduce((sum, order) => sum + order.total_price, 0);
                            const totalDiscountGiven = orders
                                .filter(order => order.has_promotion)
                                .reduce((sum, order) => sum + (order.promotion_discount || 0), 0);
                            
                            return (
                                <>
                                    <div className="promotion-stat5">
                                        <div className="promotion-stat-info5">
                                            <div className="promotion-stat-label5">Total Promotions</div>
                                            <div className="promotion-stat-value5">{promotions.length}</div>
                                        </div>
                                        <div className="promotion-stat-icon5">🎯</div>
                                    </div>
                                    <div className="promotion-stat5">
                                        <div className="promotion-stat-info5">
                                            <div className="promotion-stat-label5">Promotion Orders</div>
                                            <div className="promotion-stat-value5">{totalPromotionOrders}</div>
                                        </div>
                                        <div className="promotion-stat-icon5">📦</div>
                                    </div>
                                    <div className="promotion-stat5">
                                        <div className="promotion-stat-info5">
                                            <div className="promotion-stat-label5">Conversion Rate</div>
                                            <div className="promotion-stat-value5">{overallConversionRate.toFixed(1)}%</div>
                                        </div>
                                        <div className="promotion-stat-icon5">📈</div>
                                    </div>
                                    <div className="promotion-stat5">
                                        <div className="promotion-stat-info5">
                                            <div className="promotion-stat-label5">Total Discounts</div>
                                            <div className="promotion-stat-value5">${totalDiscountGiven.toFixed(2)}</div>
                                        </div>
                                        <div className="promotion-stat-icon5">💰</div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* Promotions Section */}
                <div className="promotions-section5">
                    <div className="promotions-header5">
                        <h2 className="promotions-title15">Promotions Management</h2>
                        <div className="promotions-info5">
                            <span className="promotions-count5">
                                {filteredPromotions.length} of {promotions.length} promotions
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container5">
                            <div className="loading-spinner5"></div>
                            <div className="loading-text5">Loading promotions...</div>
                        </div>
                    ) : error ? (
                        <div className="error-container5">
                            <div className="error-icon5">⚠️</div>
                            <div className="error-title5">Error Loading Promotions</div>
                            <div className="error-message5">{error}</div>
                        </div>
                    ) : filteredPromotions.length === 0 ? (
                        <div className="empty-state-container5">
                            {searchTerm ? (
                                <>
                                    <div className="empty-state-icon5">🔍</div>
                                    <div className="empty-state-title5">No Promotions Found</div>
                                    <div className="empty-state-message5">
                                        No promotions found matching "{searchTerm}"
                                    </div>
                                    <button 
                                        className="clear-search-btn5"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        Clear Search
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="empty-state-icon5">📋</div>
                                    <div className="empty-state-title5">No Promotions</div>
                                    <div className="empty-state-message5">No promotions found.</div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="promotions-grid15">
                            {filteredPromotions.map((p) => (
                                <div key={p._id} className="promotion-card15">
                                    {p.bannerImage ? (
                                        <img
                                            src={`http://localhost:5000${p.bannerImage}`}
                                            alt={p.title}
                                            className="promotion-card-image5"
                                        />
                                    ) : (
                                        <div className="promotion-card-no-image5">No Image</div>
                                    )}
                                    
                                    <div className="promotion-card-content15">
                                        <h3 className="promotion-card-title5">{p.title}</h3>
                                        
                                        {(() => {
                                            const product = getProductByCode(p.productId);
                                            if (product) {
                                                const originalPrice = product.pamount;
                                                const discountedPrice = originalPrice - (originalPrice * p.discount / 100);
                                                return (
                                                    <div className="promotion-product-info5">
                                                        <div className="promotion-product-name5">📦 {product.pname}</div>
                                                        <div className="promotion-product-details5">
                                                            Code: {product.pcode} | Size: {product.psize} | Color: {product.pcolor}
                                                        </div>
                                                        <div className="promotion-price-section5">
                                                            <span className="original-price5">${originalPrice}</span>
                                                            <span className="discounted-price5">${discountedPrice.toFixed(2)}</span>
                                                            <span className="save-badge5">SAVE ${(originalPrice - discountedPrice).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return <div className="product-not-found5">Product ID: {p.productId} (Product not found)</div>;
                                        })()}
                                        
                                        <div className="promotion-details5">
                                            <div className="promotion-detail-item5">
                                                <span className="detail-label5">Description:</span>
                                                <span className="detail-value5">{p.description || 'N/A'}</span>
                                            </div>
                                            <div className="promotion-detail-item5">
                                                <span className="detail-label5">Discount:</span>
                                                <span className="detail-value5">{p.discount}%</span>
                                            </div>
                                            <div className="promotion-detail-item5">
                                                <span className="detail-label5">Start Date:</span>
                                                <span className="detail-value5">{p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            <div className="promotion-detail-item5">
                                                <span className="detail-label5">End Date:</span>
                                                <span className="detail-value5">{p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                        
                                        {(() => {
                                            const performance = getPromotionPerformance(p);
                                            return (
                                                <div className="promotion-performance5">
                                                    <div className="promotion-performance-title5">📊 Performance Metrics</div>
                                                    <div className="promotion-performance-grid5">
                                                        <div className="performance-item5">
                                                            <span className="performance-label5">Orders:</span>
                                                            <span className="performance-value5">{performance.orderCount}</span>
                                                        </div>
                                                        <div className="performance-item5">
                                                            <span className="performance-label5">Conversion:</span>
                                                            <span className="performance-value5">{performance.conversionRate.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="performance-item5">
                                                            <span className="performance-label5">Revenue:</span>
                                                            <span className="performance-value5">${performance.totalRevenue.toFixed(2)}</span>
                                                        </div>
                                                        <div className="performance-item5">
                                                            <span className="performance-label5">Avg Order:</span>
                                                            <span className="performance-value5">${performance.avgOrderValue.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    {performance.totalDiscountGiven > 0 && (
                                                        <div className="promotion-discount-total5">
                                                            💰 Total Discount Given: ${performance.totalDiscountGiven.toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        
                                        <div className="promotion-actions5">
                                            <button 
                                                className="promotion-btn5 promotion-btn-edit5"
                                                onClick={() => handleEdit(p)} 
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="promotion-btn5 promotion-btn-delete5"
                                                onClick={() => handleDelete(p._id)} 
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default PromotionDashboard;
