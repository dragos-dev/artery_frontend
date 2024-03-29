import { ru } from "date-fns/locale";
import { formatDistanceStrict } from "date-fns";

function Timer({
	timestamp,
	timeTo,
}: { timestamp: EpochTimeStamp | Date; timeTo: EpochTimeStamp | Date }) {
	return (
		<>
			{formatDistanceStrict(
				timestamp,
				timeTo,
				{
					locale: ru,
				},
			)}
		</>
	);
}

export default Timer;
