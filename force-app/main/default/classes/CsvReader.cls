/**
 * Created on Dec 27 2023
 * @author Aamir, BugendaiTech
 * @description CSV Parsing Utility, inspired heavily by
 * <a href="https://github.com/redteal/apex-csv/blob/master/src/classes/RT_CSVReader.cls">
 *     jdcrensh's work published on GitHub
 * </a>
 */
public class CsvReader implements Iterable<List<String>>, Iterator<List<String>> {

	private final static String COMMA = ',';
	private final static String CARRIAGE_RETURN = '\r';
	private final static String LINE_FEED = '\n';
	private final static String CARRIAGE_RETURN_LINE_FEED = '\r\n';
	private final static String QUOTE = '"';
	private final static String DOUBLE_QUOTE = '""';

	private String csvString;
	private Integer csvStringLength;
	private Integer position = 0;
	private Iterator<List<String>> iterator;

	public CsvReader(String csvString) {
		this.csvString = convertLineEndings(csvString);
		this.csvStringLength = csvString.length();
		this.iterator = iterator();
	}

	/**
	 * @description Used to return parsed CSV
	 *
	 * @param csvString string containing contents of CSV
	 *
	 * @return Array of rows represented as map of key-value pairs of column headers to column values
	 */
	public static List<Map<String, String>> read(String csvString) {
		List<Map<String, String>> mappedRowValues = new List<Map<String, String>>();
		List<List<String>> data = new List<List<String>>();
		CsvReader reader = new CsvReader(csvString);
		while (reader.iterator.hasNext()) {
			data.add(reader.iterator.next());
		}
		for (Integer i = 1; i < (data.size()); i++) {
			mappedRowValues.add(new Map<String, String>());
            //System.debug(' data[i].size():'+ data[i].size());
			for (Integer j = 0; j < data[i].size(); j++) {
                //System.debug('j'+j);
                //System.debug('i - 1---'+ i);
                //System.debug('data[0][j].trim()-----'+data[0][j].trim());
                //System.debug('data[i][j].trim()-----'+data[i][j].trim());
                if(String.isNotBlank(data[0][j].trim()) &&String.isNotBlank(data[i][j].trim()))
				mappedRowValues.get(i - 1).put(data[0][j].trim(), data[i][j].trim());
			}
		}
		return mappedRowValues;
	}

	private static String convertLineEndings(String str) {
		return str.replace(CARRIAGE_RETURN_LINE_FEED, LINE_FEED).replace(CARRIAGE_RETURN, LINE_FEED);
	}

	public Iterator<List<String>> iterator() {
		return this;
	}

	public Boolean hasNext() {
		return position < csvStringLength;
	}

	public List<String> next() {
		List<String> values = new List<String>();
		position = readLine(position, values);
		return values;
	}

	private Integer readLine(Integer position, List<String> values) {
		String currentValue;
		Integer commaAt;
		Integer nextLineAt;
		Integer foundAt;
		Integer startPosition = position;
		List<String> tempValues = new List<String>();
		while (position < csvStringLength) {
			commaAt = csvString.indexOf(COMMA, position);
			nextLineAt = csvString.indexOf(LINE_FEED, position);
			if (commaAt == -1 && nextLineAt == -1) {
				position = csvStringLength;
				break;
			}
			foundAt = Math.min(commaAt, nextLineAt);

			if (foundAt < 0) {
				foundAt = Math.max(commaAt, nextLineAt);
				currentValue = csvString.substring(startPosition, foundAt);
				position = foundAt + 1;
			} else {
				currentValue = csvString.substring(startPosition, foundAt);
				position = foundAt + 1;
			}

			if (!currentValue.startsWith(QUOTE)) {
				tempValues.add(currentValue);
				if (foundAt == nextLineAt) {
					break;
				}
				startPosition = position;
			} else if (currentValue == DOUBLE_QUOTE) {
				tempValues.add('');
				if (foundAt == nextLineAt) {
					break;
				}
				startPosition = position;
			} else if (currentValue.endsWith(QUOTE)) {
				Integer lastIndex = currentValue.length() - 1;
				tempValues.add(currentValue.substring(1, lastIndex));
				if (foundAt == nextLineAt) {
					break;
				}
				startPosition = position;
			}
		}
		values.addAll(tempValues);
		return position;
	}
}