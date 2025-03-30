"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function BurgerMenu() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuItems = [
		{ path: "/", label: "Home" },
		{ path: "/about", label: "About" },
	];

	return (
		<nav className="relative w-full ps-16">
			{/* Burger Button */}
			<button
				className="p-2 rounded-md focus:outline-none"
				// focus:ring-2 focus:ring-gray-400
				onClick={() => setIsMenuOpen((prev) => !prev)}
				aria-label="Toggle Menu"
			>
				<motion.div
					animate={{ rotate: isMenuOpen ? 90 : 0 }}
					transition={{ duration: 0.3 }}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="30"
						height="30"
						fill="currentColor"
						className="bi bi-list"
						viewBox="0 0 16 16"
					>
						<path
							fillRule="evenodd"
							d="M2 12h12M2 8h12M2 4h12"
							stroke="black"
							strokeWidth="1.5"
							strokeLinecap="round"
						/>
					</svg>
				</motion.div>
			</button>

			{/* Menu */}
			<AnimatePresence>
				{isMenuOpen && (
					<motion.ul
						initial={{ opacity: 0, x: 50, y: -10 }}
						animate={{ opacity: 1, x: 50, y: 15 }}
						exit={{ opacity: 0, x: 50, y: -10 }}
						transition={{ duration: 0.3 }}
						className="absolute top-14 left-0 w-48 bg-white shadow-lg rounded-lg p-4 space-y-2"
					>
						{menuItems.map((item) => (
							<li key={item.path}>
								<Link
									className="block p-2 hover:bg-gray-100 rounded-md"
									href={item.path}
									prefetch={true}
									onClick={() => setIsMenuOpen(false)}
								>
									{item.label}
								</Link>
							</li>
						))}
					</motion.ul>
				)}
			</AnimatePresence>
		</nav>
	);
}
