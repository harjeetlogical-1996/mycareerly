import Navbar from "../../components/NavbarServer";
import Footer from "../../components/Footer";
import CreateListingForm from "./CreateListingForm";

export default function CreateListingPage() {
  return (
    <>
      <Navbar />
      <CreateListingForm />
      <Footer />
    </>
  );
}
