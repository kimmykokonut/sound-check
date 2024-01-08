function Browse () {
  function handleForm(){

  }
  return (
    <>
    <h1>Let's go check some sounds!</h1>
    <form>
      <input
      placeholder="my location..."
      type="text"></input>
      <button type="submit">show me shows near me</button>
    </form>
    <hr />
    <h3>Results go here</h3>
    <span></span> 
    </>
  )
}
export default Browse;