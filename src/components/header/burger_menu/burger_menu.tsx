"use client";

import Link from "next/link";
import { useState } from "react";

export default function BurgerMenu() {
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>();
	return (
		<nav className="relative w-full shadowm-md">
			<button
				className="flex justify-center items-center ps-16"
				onClick={() => setIsMenuOpen((prev) => !prev)}
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
						d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
					/>
				</svg>
			</button>
			<ul
				className={`${
					isMenuOpen ? "flex" : "hidden"
				} absolute top-0 left-32 flex-col`}
			>
				<li>
					<Link href="/">Home</Link>
				</li>
				<li>
					<Link href="/about">About</Link>
				</li>
			</ul>
		</nav>
	);
}
