import Header from "@/components/header/header";
import Main from "@/components/main/main";
import Footer from "@/components/footer/footer";

export default function Home() {
	return (
		<div className="w-full h-full flex flex-col">
			<Header />
			<Main />
			<Footer />
		</div>
	);
}
