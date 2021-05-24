import React from "react";
import { Doughnut } from "react-chartjs-2";

const data = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "# of Votes",
      data: [1, 19, 3, 5, 2, 3],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)"
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)"
      ],
      borderWidth: 1,
      polyline: {
        color: "gray",
        labelColor: "gray",
        formatter: (value) => `formatted ${value}`
      }
    }
  ]
};

const plugins = [
  {
    afterDraw: (chart) => {
      const ctx = chart.chart.ctx;
      ctx.save();
      ctx.font = "10px 'Averta Std CY'";
      const leftLabelCoordinates = [];
      const rightLabelCoordinates = [];
      const chartCenterPoint = {
        x:
          (chart.chartArea.right - chart.chartArea.left) / 2 +
          chart.chartArea.left,
        y:
          (chart.chartArea.bottom - chart.chartArea.top) / 2 +
          chart.chartArea.top
      };
      chart.config.data.labels.forEach((label, i) => {
        const meta = chart.getDatasetMeta(0);
        const arc = meta.data[i];
        const dataset = chart.config.data.datasets[0];

        // Prepare data to draw
        // important point 1
        const centerPoint = arc.getCenterPoint();
        const model = arc._model;
        let color = model.borderColor;
        let labelColor = model.borderColor;
        if (dataset.polyline && dataset.polyline.color) {
          color = dataset.polyline.color;
        }

        if (dataset.polyline && dataset.polyline.labelColor) {
          labelColor = dataset.polyline.labelColor;
        }

        const angle = Math.atan2(
          centerPoint.y - chartCenterPoint.y,
          centerPoint.x - chartCenterPoint.x
        );
        // important point 2, this point overlapsed with existed points
        // so we will reduce y by 14 if it's on the right
        // or add by 14 if it's on the left
        const point2X =
          chartCenterPoint.x + Math.cos(angle) * (model.outerRadius + 20);
        let point2Y =
          chartCenterPoint.y + Math.sin(angle) * (model.outerRadius + 20);

        let overlapsedPoint;
        if (point2X < chartCenterPoint.x) {
          overlapsedPoint = leftLabelCoordinates.find(
            (y) => y + 7 > point2Y && y - 7 < point2Y
          );
        } else {
          overlapsedPoint = rightLabelCoordinates.find(
            (y) => y + 7 > point2Y && y - 7 < point2Y
          );
        }

        if (overlapsedPoint && point2X < chartCenterPoint.x) {
          point2Y += 10;
        } else {
          point2Y -= 10;
        }

        let value = dataset.data[i];
        if (dataset.polyline && dataset.polyline.formatter) {
          value = dataset.polyline.formatter(value);
        }
        let edgePointX = point2X < chartCenterPoint.x ? 10 : chart.width - 10;

        if (point2X < chartCenterPoint.x) {
          leftLabelCoordinates.push(point2Y);
        } else {
          rightLabelCoordinates.push(point2Y);
        }
        //DRAW CODE
        // first line: connect between arc's center point and outside point
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(centerPoint.x, centerPoint.y);
        ctx.lineTo(point2X, point2Y);
        ctx.stroke();
        // second line: connect between outside point and chart's edge
        ctx.beginPath();
        ctx.moveTo(point2X, point2Y);
        ctx.lineTo(edgePointX, point2Y);
        ctx.stroke();
        //fill custom label
        const labelAlignStyle =
          edgePointX < chartCenterPoint.x ? "left" : "right";
        const labelX = edgePointX;
        const labelY = point2Y;
        ctx.textAlign = labelAlignStyle;
        ctx.textBaseline = "bottom";

        ctx.fillStyle = labelColor;
        ctx.fillText(value, labelX, labelY);
      });
      ctx.restore();
    }
  }
];

const options = {
  legend: {
    display: false
  },
  layout: {
    padding: {
      top: 40,
      left: 0,
      right: 0,
      bottom: 40
    }
  }
};

const DoughnutChart = () => (
  <Doughnut data={data} options={options} plugins={plugins} />
);

export default DoughnutChart;
