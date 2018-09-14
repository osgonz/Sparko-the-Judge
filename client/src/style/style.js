import { createMuiTheme } from '@material-ui/core/styles';

var AppTheme = createMuiTheme({

	breakpoints : {
		keys: 	["xs", "sm", "md", "lg", "xl"],
		values: {
			xs: 0,
			sm: 600,
			md: 960,
			lg: 1280,
			xl: 1920,
		},
	},
	palette: {
		type: 'light',
		primary: {
			main: '#4a138c',
		},
		secondary: {
			main: '#f9c42d',
		},
		contrastThreshold: 3,
		tonalOffset: 0.2,
		text: {
			primary: "rgba(0, 0, 0, 0.87)",
			secondary: "rgba(0, 0, 0, 0.54)",
			disabled: "rgba(0, 0, 0, 0.38)",
			hint: "rgba(0, 0, 0, 0.38)",
		},
		divider: "rgba(0, 0, 0, 0.12)",
		background: {
			paper: "#fff",
			default: "#fafafa",
		},
	},
	typography: {
		fontFamily: ["Roboto", "Helvetica", "Arial", 'sans-serif'],
		fontSize: 			14,
		fontWeightLight: 	300,
		fontWeightRegular: 	400,
		fontWeightMedium: 	500,
	},
	shape: {
		borderRadius: 4,
	},
	spacing: {
		unit: 8,
	},
});

export { AppTheme };
