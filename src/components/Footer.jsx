import { useNavigate } from "react-router-dom";

function Footer () {
  const navigate = useNavigate();
  return (
    <>
    <hr />
      <a href="https://github.com/kimmykokonut/sound-check">
        Designed and built by Team Awesome
      </a>
    </>
  )
}
export default Footer;