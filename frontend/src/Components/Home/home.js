import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Nav from '../Navbar/nav';
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

			<header className="hero">
				<h1>Find your next favorite fit</h1>
				<p>Fresh drops, timeless classics, and daily essentials curated for you.</p>
				<form className="search" onSubmit={handleSearch} role="search">
					<input
						type="search"
						placeholder="Search products, brands, colors..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						aria-label="Search products"
					/>
					<button type="submit">Search</button>
				</form>
			</header>

			<section className="cta-rail">
				<div className="rail-header">
					<h2>Quick actions</h2>
					<div className="rail-controls">
						<button className="rail-btn" data-target="#rail1" data-dir="left">‹</button>
						<button className="rail-btn" data-target="#rail1" data-dir="right">›</button>
					</div>
				</div>
				<div className="rail" id="rail1">
					<div className="rail-item primary" onClick={() => navigate('/items')}>
						<div className="rail-content">
							<h3>Explore</h3>
							<p>Browse all products from our catalog</p>
							<button className="pill">Explore all</button>
						</div>
					</div>
					<div className="rail-item accent">
						<div className="rail-content">
							<h3>About Us</h3>
							<p>Quality, comfort, and design at the core of everything.</p>
							<Link to="/Promotion" className="pill">See Promotions</Link>
						</div>
					</div>
					<div className="rail-item dark">
						<div className="rail-content">
							<h3>Customer Care</h3>
							<p>Fast shipping, easy returns, and dedicated support.</p>
							<Link to="/userdetails" className="pill">Your Profile</Link>
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
								{p.image ? (
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

			<footer className="mini-footer">
			</footer>
		</div>
	);
}

export default Home;
