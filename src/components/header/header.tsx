import Image from "next/image";
import logoImg from "../../../public/images/logo.jpeg";
import BurgerMenu from "./burger_menu/burger_menu";

export default function Header() {
	return (
		<header className="sticky top-0 bg-background mb-5 w-full h-28 grid grid-cols-3 gap-2 items-center justify-items-center shadow-lg rounded-br-3xl rounded-bl-3xl">
			<BurgerMenu />
			<Image className="w-38 h-24 md:w-48 md:h-28" src={logoImg} alt="Argatia Winery Logo" />
			{/* <p className="text-center">logo</p> */}
		</header>
	);
}
