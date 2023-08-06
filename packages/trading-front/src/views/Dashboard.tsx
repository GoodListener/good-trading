import Chart from "../components/dashboard/Chart.tsx";

const Dashboard = () => {

  const start = () => {
    console.log('start')
  }

  return <div>
    <button onClick={start}>Start</button>
    <Chart></Chart>
  </div>
}

export default Dashboard