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
		navigate(`/items?search=${encodeURIComponent(query.trim())}`);
	};

	return (
		<div className="home-container">
			<Nav />

			{/* Modern Hero Section */}
			<section className="modern-hero">
				<div className="hero-background">
					<div className="hero-pattern"></div>
					<div className="hero-gradient"></div>
				</div>
				
				<div className="hero-content">
					<div className="hero-text">
						<h1 className="hero-title">
							<span className="title-line">Discover Your</span>
							<span className="title-line highlight">Perfect Style</span>
						</h1>
						<p className="hero-subtitle">
							Fresh drops, timeless classics, and daily essentials curated for the modern lifestyle.
							Experience fashion that moves with you.
						</p>
						
						<div className="hero-actions">
							<form className="hero-search" onSubmit={handleSearch} role="search">
								<div className="search-container">
									<input
										type="search"
										placeholder="Search products, brands, colors..."
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										aria-label="Search products"
										className="search-input"
									/>
									<button type="submit" className="search-btn">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<circle cx="11" cy="11" r="8"></circle>
											<path d="m21 21-4.35-4.35"></path>
										</svg>
									</button>
								</div>
							</form>
							
							<div className="hero-buttons">
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
					</div>
				</div>
				
				<div className="scroll-indicator">
					<div className="scroll-arrow">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M7 13l3 3 3-3M7 6l3 3 3-3"></path>
						</svg>
					</div>
				</div>
			</section>

			{/* Quick Actions Section */}
			<section className="quick-actions">
				<div className="actions-container">
					<div className="section-header">
						<h2 className="section-title">
							<span className="title-icon">⚡</span>
							Quick Actions
						</h2>
						<p className="section-subtitle">Everything you need, right at your fingertips</p>
					</div>
					
					<div className="actions-grid">
						<div className="action-card primary" onClick={() => navigate('/items')}>
							<div className="card-background">
								<div className="card-pattern"></div>
								<div className="card-gradient"></div>
							</div>
							<div className="card-content">
								<div className="card-icon">
									<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
									</svg>
								</div>
								<h3 className="card-title">Shop Now</h3>
								<p className="card-description">Discover our latest collection of premium products</p>
								<div className="card-action">
									<span className="action-text">Explore All</span>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M5 12h14M12 5l7 7-7 7"></path>
									</svg>
								</div>
							</div>
						</div>

						<div className="action-card secondary" onClick={() => navigate('/Promotion')}>
							<div className="card-background">
								<div className="card-pattern"></div>
								<div className="card-gradient"></div>
							</div>
							<div className="card-content">
								<div className="card-icon">
									<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
									</svg>
								</div>
								<h3 className="card-title">Promotions</h3>
								<p className="card-description">Exclusive deals and limited-time offers</p>
								<div className="card-action">
									<span className="action-text">View Deals</span>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M5 12h14M12 5l7 7-7 7"></path>
									</svg>
								</div>
							</div>
						</div>

						<div className="action-card accent" onClick={() => navigate('/userdetails')}>
							<div className="card-background">
								<div className="card-pattern"></div>
								<div className="card-gradient"></div>
							</div>
							<div className="card-content">
								<div className="card-icon">
									<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
										<circle cx="12" cy="7" r="4"></circle>
									</svg>
								</div>
								<h3 className="card-title">My Profile</h3>
								<p className="card-description">Manage your account and preferences</p>
								<div className="card-action">
									<span className="action-text">View Profile</span>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M5 12h14M12 5l7 7-7 7"></path>
									</svg>
								</div>
							</div>
						</div>

					</div>
				</div>
			</section>

			<section className="product-rail">
				<div className="rail-header">
					<h2>Trending now</h2>
					<div className="rail-controls">
						<button className="rail-btn" data-target="#rail2" data-dir="left">‹</button>
						<button className="rail-btn" data-target="#rail2" data-dir="right">›</button>
					</div>
				</div>
				<div className="rail cards" id="rail2">
					{loading && <div className="rail-empty">Loading...</div>}
					{!loading && error && <div className="rail-empty error">{error}</div>}
					{!loading && !error && featured.length === 0 && (
						<div className="rail-empty">No products yet</div>
					)}
					{featured.map((p) => (
						<div key={p._id} className="card">
							<div className="card-media">
								{(p.images && p.images.length > 0) ? (
									<img src={`http://localhost:5000${p.images[0]}`} alt={p.pname} />
								) : p.image ? (
									<img src={`http://localhost:5000${p.image}`} alt={p.pname} />
								) : (
									<div className="placeholder">No Image</div>
								)}
							</div>
							<div className="card-body">
								<h4 className="card-title">{p.pname}</h4>
								{(() => {
									const hasPromo = p.hasActivePromotion || (p.promotion && p.promotion.discount > 0);
									const original = typeof p.originalPrice !== 'undefined' ? p.originalPrice : p.pamount;
									const discountPct = p.promotion?.discount;
									const discounted = typeof p.discountedPrice !== 'undefined'
										? p.discountedPrice
										: (hasPromo && discountPct ? Number((Number(original) * (100 - Number(discountPct)) / 100).toFixed(2)) : null);
									if (hasPromo && discounted !== null) {
										return (
											<div className="price-stack">
												<div className="old-price">${original}</div>
												<div className="sale-row">
													<span className="sale-price">${discounted}</span>
													{discountPct ? <span className="discount-badge">{discountPct}% OFF</span> : null}
												</div>
											</div>
										);
									}
									return (
										<div className="card-meta">
											<span className="price">${p.pamount}</span>
											<span className="color">{p.pcolor}</span>
										</div>
									);
								})()}
								<button className="pill" onClick={() => navigate(`/products/${p._id}`)}>View</button>
							</div>
						</div>
					))}
				</div>
			</section>

			<Footer />
		</div>
	);
}

export default Home;
