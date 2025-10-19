import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../Navbar/nav';
import Footer from '../Footer/Footer';
import api from '../../utils/api';
import './promotionmanager.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../assets/logo.png';

function PromotionDashboard() {
    const [promotions, setPromotions] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPromotions, setFilteredPromotions] = useState([]);
    const navigate = useNavigate();

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

    // generate pdf
    const generatePDF = () => {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();
        
        // Add logo to PDF header
        const img = new Image();
        img.onload = function() {
            
            doc.addImage(img, 'PNG', 10, 10, 10, 10);
            
            
            doc.setFontSize(20);
            doc.text('Promotion Dashboard Report', 70, 30);
            
            doc.setFontSize(12);
            doc.text(`Generated on: ${currentDate}`, 70, 45);
            doc.text(`Total Promotions: ${promotions.length}`, 70, 55);
            
            
            generatePDFContent(doc, currentDate);
        };
        
        
        img.onerror = function() {
            console.log('Logo failed to load, generating PDF without logo');
            
            doc.setFontSize(20);
            doc.text('Promotion Dashboard Report', 20, 30);
            
            doc.setFontSize(12);
            doc.text(`Generated on: ${currentDate}`, 20, 45);
            doc.text(`Total Promotions: ${promotions.length}`, 20, 55);
            
            
            generatePDFContent(doc, currentDate);
        };
        
        img.src = logo;
    };

    
    const generatePDFContent = (doc, currentDate) => {
        
        // Calculate summary statistics to pdf
        const totalPromotionOrders = orders.filter(order => order.has_promotion).length;
        const totalOrders = orders.length;
        const overallConversionRate = totalOrders > 0 ? (totalPromotionOrders / totalOrders) * 100 : 0;
        const totalPromotionRevenue = orders
            .filter(order => order.has_promotion)
            .reduce((sum, order) => sum + order.total_price, 0);
        const totalDiscountGiven = orders
            .filter(order => order.has_promotion)
            .reduce((sum, order) => sum + (order.promotion_discount || 0), 0);
        
        
        doc.setFontSize(14);
        doc.text('Summary Statistics', 20, 75);
        
        doc.setFontSize(10);
        doc.text(`Total Promotion Orders: ${totalPromotionOrders}`, 20, 85);
        doc.text(`Overall Conversion Rate: ${overallConversionRate.toFixed(1)}%`, 20, 95);
        doc.text(`Total Promotion Revenue: $${totalPromotionRevenue.toFixed(2)}`, 20, 105);
        doc.text(`Total Discounts Given: $${totalDiscountGiven.toFixed(2)}`, 20, 115);
        
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
        doc.text('Promotions Details', 20, 135);
        
        autoTable(doc, {
            startY: 145,
            head: [['Title', 'Product', 'Code', 'Discount', 'Original Price', 'Discounted Price', 'Start Date', 'End Date', 'Orders', 'Conversion', 'Revenue', 'Avg Order']],
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 20, right: 20 },
            tableWidth: 'auto',
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
            }
        });
        
        // Add footer with logo
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
            doc.text('Snazzy Promotion Dashboard Report', doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 10);
            
            
            try {
                const footerImg = new Image();
                footerImg.onload = function() {
                    doc.addImage(footerImg, 'PNG', doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 15, 15, 15);
                };
                footerImg.src = logo;
            } catch (error) {
                console.log('Footer logo failed to load');
            }
        }
        
        // Save the PDF
        doc.save(`promotion-dashboard-report-${currentDate.replace(/\//g, '-')}.pdf`);
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
                        <button 
                            className="pdf-export-btn5"
                            onClick={generatePDF}
                            disabled={loading || promotions.length === 0}
                        >
                            📄 Export PDF
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
