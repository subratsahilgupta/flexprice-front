import { dataJSON, CountryData } from './data';

export interface Currency extends CountryData {
	/**
	 * @description Two-symbol country ISO code
	 * @example 'UA'
	 */
	iso: string;
}

type CurrencySymbol = 'symbol' | 'currency';
type SearchParam = CurrencySymbol | 'countryName' | 'dateFormat';

const currencyAndSymbol: CurrencySymbol[] = ['currency', 'symbol'];
const allSearchParams: SearchParam[] = [...currencyAndSymbol, 'countryName', 'dateFormat'];

/**
 * Get all ISO codes with their corresponding information
 */
export function getAllISOCodes(): Currency[] {
	return Object.entries(dataJSON).map(([key, value]) => ({
		...value,
		iso: key,
	}));
}

/**
 * Get all information for a specific ISO code
 */
export function getAllInfoByISO(iso: string): Currency {
	const upperIso = iso.toUpperCase();
	const data = dataJSON[upperIso];

	if (!data) {
		throw new Error("ISO2 code wasn't found");
	}

	return {
		...data,
		iso: upperIso,
	};
}

/**
 * Get a specific parameter value for an ISO code
 */
export function getParamByISO(iso: string, param: SearchParam): string {
	checkParam(param, allSearchParams);
	const upperIso = iso.toUpperCase();
	const data = dataJSON[upperIso];

	if (!data) {
		throw new Error("ISO2 code wasn't found");
	}

	const value = data[param];
	if (value === undefined) {
		throw new Error(`Parameter ${param} not found for ISO code ${upperIso}`);
	}

	return value;
}

/**
 * Get ISO code by searching for a specific parameter value
 */
export function getISOByParam(param: SearchParam, value: string): string {
	checkParam(param, allSearchParams);

	const entry = Object.entries(dataJSON).find(([_, data]) => data[param] === value);

	if (!entry) {
		throw new Error(`${value} wasn't found in ${param}`);
	}

	return entry[0];
}

/**
 * Get a parameter value by searching with another parameter
 */
export function getParamByParam(givenParam: SearchParam, givenParamValue: string, searchParam: SearchParam): string {
	checkParam(givenParam, allSearchParams);
	checkParam(searchParam, allSearchParams);

	const entry = Object.entries(dataJSON).find(([_, data]) => data[givenParam] === givenParamValue);

	if (!entry) {
		throw new Error(`${givenParamValue} wasn't found in ${givenParam}`);
	}

	const value = entry[1][searchParam];
	if (value === undefined) {
		throw new Error(`Parameter ${searchParam} not found for ${givenParam} = ${givenParamValue}`);
	}

	return value;
}

/**
 * Get all country names that use a specific currency or symbol
 */
export function getAllCountriesByCurrencyOrSymbol(param: CurrencySymbol, value: string): string[] {
	checkParam(param, currencyAndSymbol);

	const countries = Object.values(dataJSON)
		.filter((data) => data[param] === value)
		.map((data) => data.countryName);

	if (countries.length === 0) {
		throw new Error(`${value} wasn't found in ${param}`);
	}

	return countries;
}

/**
 * Get all ISO codes that use a specific currency or symbol
 */
export function getAllISOByCurrencyOrSymbol(param: CurrencySymbol, value: string): string[] {
	checkParam(param, currencyAndSymbol);

	const isoCodes = Object.entries(dataJSON)
		.filter(([_, data]) => data[param] === value)
		.map(([iso]) => iso);

	if (isoCodes.length === 0) {
		throw new Error(`${value} wasn't found in ${param}`);
	}

	return isoCodes;
}

/**
 * Check if a parameter is valid
 */
function checkParam(param: SearchParam, paramArray: SearchParam[]): void {
	if (!paramArray.includes(param)) {
		throw new Error('Invalid search param');
	}
}
