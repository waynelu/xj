var config = {
	"es" : {
		"host" : "localhost:9200",
    "logLevel": "trace",
    "index": "xj",
    "type": "event"
	},
  "spark": {
    "command": "/Users/wlu000/spark/spark-1.6.2-bin-hadoop2.6/bin/spark-submit --class com.r2.xj.DataForecast /Users/wlu000/spark/spark-xj/target/xj-data-forecast-0.0.1-SNAPSHOT-jar-with-dependencies.jar"
    //"command": "/home/ubuntu/spark-1.6.2-bin-hadoop2.6/bin/spark-submit --class com.r2.xj.DataForecast /home/ubuntu/spark-xj/target/xj-data-forecast-0.0.1-SNAPSHOT-jar-with-dependencies.jar"
  }
};

module.exports = config;