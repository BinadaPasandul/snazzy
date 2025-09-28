import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Nav from '../Navbar/nav';
import Footer from '../Footer/Footer';
import './Home.css';
import api from '../../utils/api';

function Home() {
	const navigate = useNavigate();
	const [query, setQuery] = useState('');
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [searchHistory, setSearchHistory] = useState([]);
	const [popularSearches] = useState(['shirts', 'jeans', 'shoes', 'accessories', 'dresses', 'jackets']);

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true);
				const res = await api.get('/products');
				setProducts(res.data.products || []);
			} catch (e) {
				setError('Failed to load products');
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const featured = useMemo(() => (products || []).slice(0, 8), [products]);

	const handleSearch = (e) => {
		e.preventDefault();
		if (!query.trim()) return;
		
		// Add to search history
		const trimmedQuery = query.trim();
		if (!searchHistory.includes(trimmedQuery)) {
			setSearchHistory(prev => [trimmedQuery, ...prev.slice(0, 4)]);
		}
		
		navigate(`/items?search=${encodeURIComponent(trimmedQuery)}`);
		setShowSuggestions(false);
	};

	const handleSuggestionClick = (suggestion) => {
		setQuery(suggestion);
		setShowSuggestions(false);
	};

	const handleInputFocus = () => {
		setShowSuggestions(true);
	};

	const handleInputBlur = () => {
		// Delay hiding suggestions to allow clicking on them
		setTimeout(() => setShowSuggestions(false), 200);
	};

	const clearSearch = () => {
		setQuery('');
		setShowSuggestions(false);
	};

	return (
		<div className="home-container">
			<Nav />

			{/* Hero Section with Search */}
			<section className="hero-section">
				<div className="hero-background">
					<div className="hero-overlay"></div>
					<div className="hero-particles"></div>
				</div>
				
				<div className="hero-content">
					<div className="hero-text">
						<h1 className="hero-title">
							<span className="title-primary">Discover</span>
							<span className="title-secondary">Amazing Products</span>
						</h1>
						<p className="hero-description">
							Find the perfect items for your lifestyle. Quality products, great prices, and exceptional service.
						</p>
					</div>
					
					{/* Search Bar */}
					<div className="search-section">
						<div className="enhanced-search-container">
							<form className="hero-search" onSubmit={handleSearch} role="search">
								<div className="search-wrapper">
									<div className="search-container">
										<div className="search-icon">
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<circle cx="11" cy="11" r="8"></circle>
												<path d="m21 21-4.35-4.35"></path>
											</svg>
										</div>
										<input
											type="search"
											placeholder="Search products, brands, colors..."
											value={query}
											onChange={(e) => setQuery(e.target.value)}
											onFocus={handleInputFocus}
											onBlur={handleInputBlur}
											aria-label="Search products"
											className="search-input"
										/>
										{query && (
											<button type="button" className="clear-btn" onClick={clearSearch}>
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<line x1="18" y1="6" x2="6" y2="18"></line>
													<line x1="6" y1="6" x2="18" y2="18"></line>
												</svg>
											</button>
										)}
										<button type="submit" className="search-btn">
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<circle cx="11" cy="11" r="8"></circle>
												<path d="m21 21-4.35-4.35"></path>
											</svg>
										</button>
									</div>
								</div>
								
								{/* Search Suggestions */}
								{showSuggestions && (
									<div className="search-suggestions">
										{searchHistory.length > 0 && (
											<div className="suggestion-section">
												<div className="suggestion-header">
													<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
														<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
														<path d="M3 3v5h5"></path>
													</svg>
													<span>Recent Searches</span>
												</div>
												{searchHistory.map((term, index) => (
													<div key={index} className="suggestion-item" onClick={() => handleSuggestionClick(term)}>
														<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
															<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
															<path d="M3 3v5h5"></path>
														</svg>
														<span>{term}</span>
													</div>
												))}
											</div>
										)}
										
										<div className="suggestion-section">
											<div className="suggestion-header">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
												</svg>
												<span>Popular Searches</span>
											</div>
											{popularSearches.map((term, index) => (
												<div key={index} className="suggestion-item" onClick={() => handleSuggestionClick(term)}>
													<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
														<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
													</svg>
													<span>{term}</span>
												</div>
											))}
										</div>
									</div>
								)}
							</form>
						</div>
					</div>
					
					<div className="hero-actions">
						<button 
							className="btn-primary"
							onClick={() => navigate('/items')}
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
							</svg>
							Shop Now
						</button>
						<button 
							className="btn-secondary"
							onClick={() => navigate('/Promotion')}
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
							</svg>
							View Promotions
						</button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="features-section">
				<div className="container">
					<div className="section-header">
						<h2 className="section-title">Why Choose Us?</h2>
						<p className="section-subtitle">Experience the difference with our premium service</p>
					</div>
					
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
								</svg>
							</div>
							<h3 className="feature-title">Quality Products</h3>
							<p className="feature-description">Carefully curated selection of premium products</p>
						</div>
						
						<div className="feature-card">
							<div className="feature-icon">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
								</svg>
							</div>
							<h3 className="feature-title">Best Prices</h3>
							<p className="feature-description">Competitive pricing with regular promotions</p>
						</div>
						
						<div className="feature-card">
							<div className="feature-icon">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
									<circle cx="12" cy="7" r="4"></circle>
								</svg>
							</div>
							<h3 className="feature-title">Expert Support</h3>
							<p className="feature-description">24/7 customer support for all your needs</p>
						</div>
					</div>
				</div>
			</section>

			{/* Products Section */}
			<section className="products-section">
				<div className="container">
					<div className="section-header">
						<h2 className="section-title">Trending Products</h2>
						<p className="section-subtitle">Discover our most popular items</p>
					</div>
					
					<div className="products-grid">
						{loading && <div className="loading-state">Loading products...</div>}
						{!loading && error && <div className="error-state">{error}</div>}
						{!loading && !error && featured.length === 0 && (
							<div className="empty-state">No products available</div>
						)}
						{featured.map((p) => (
							<div key={p._id} className="product-card">
								<div className="product-image">
									{(p.images && p.images.length > 0) ? (
										<img src={`http://localhost:5000${p.images[0]}`} alt={p.pname} />
									) : p.image ? (
										<img src={`http://localhost:5000${p.image}`} alt={p.pname} />
									) : (
										<div className="placeholder">No Image</div>
									)}
								</div>
								<div className="product-info">
									<h3 className="product-name">{p.pname}</h3>
									{(() => {
										const hasPromo = p.hasActivePromotion || (p.promotion && p.promotion.discount > 0);
										const original = typeof p.originalPrice !== 'undefined' ? p.originalPrice : p.pamount;
										const discountPct = p.promotion?.discount;
										const discounted = typeof p.discountedPrice !== 'undefined'
											? p.discountedPrice
											: (hasPromo && discountPct ? Number((Number(original) * (100 - Number(discountPct)) / 100).toFixed(2)) : null);
										if (hasPromo && discounted !== null) {
											return (
												<div className="price-container">
													<div className="original-price">${original}</div>
													<div className="price-row">
														<span className="current-price">${discounted}</span>
														{discountPct ? <span className="discount-tag">{discountPct}% OFF</span> : null}
													</div>
												</div>
											);
										}
										return (
											<div className="price-container">
												<span className="current-price">${p.pamount}</span>
												<span className="product-color">{p.pcolor}</span>
											</div>
										);
									})()}
									<button className="view-btn" onClick={() => navigate(`/products/${p._id}`)}>
										View Details
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}

export default Home;
