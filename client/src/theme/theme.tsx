import { ThemeOptions, createTheme } from "@mui/material/styles";
import { lightModeThemeValues } from "./lightMode";

declare module "@mui/material/styles" {
  interface Theme {
    borderStyle: {
      main: string;
    };
    background: {
      default: string;
    };
    boxShadow: {
      main: string;
    };
  }

  interface Palette {
    primary: PaletteColor;
    text: TypeText;
    borderStyle: {
      main: string;
    };
    background: TypeBackground;
    boxShadow: {
      main: string;
    };
  }

  interface TypeBackground {
    default: string;
  }

  interface PaletteColor {
    main: string;
    light: string;
    dark: string;
  }

  interface TypeText {
    primary: string;
    secondary: string;
    dark: string;
  }
}

const mainValues = {
  typography: {
    fontFamily: `'Inter', sans-serif;`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,

    h1: {
      fontFamily: `'Poppins', sans-serif;`,

      fontSize: "2.25rem", // 36px
      lineHeight: "2.75rem", // 44px
      fontWeight: 500,
    },
    h2: {
      fontFamily: `'Poppins', sans-serif;`,
      fontSize: "2.25rem", // 36px
      lineHeight: "1.75rem", // 28px
      fontWeight: 700,
    },

    body1: {
      fontSize: 14,
      wordWrap: "break-word",
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 10,
  },
};

export const getTheme = () => {
  let theme = lightModeThemeValues;

  const customTheme = createTheme({
    ...theme,
    ...mainValues,
  } as ThemeOptions);

  return customTheme;
};
