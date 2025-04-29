import GaugeChart from "react-gauge-chart"

const CustomGaugeChart = ({ value }) => {
  return (
    <div className="h-[400px] w-full flex items-center justify-center">
      <GaugeChart
        id="maturity-gauge"
        nrOfLevels={5}
        colors={["#FF4444", "#FFBB33", "#00C851", "#33B5E5", "#2BBBAD"]}
        percent={value / 100}
        textColor="#000000"
        needleColor="#345243"
        needleBaseColor="#333"
        needleBaseWidth={3}
        arcWidth={0.3}
        cornerRadius={1}
      />
    </div>
  )
}

export default CustomGaugeChart
