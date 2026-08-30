import COLORS, { Colors } from "../utils/Colors";

export const getThemeColors = theme => ({
  backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fff',
  textColor: theme === 'dark' ? COLORS.WHITE : Colors.BLACK,
  borderColor: theme === 'dark' ? '#292929' : '#E5E7EB',
  dropdownValueColor: theme === 'dark' ? '#ff7961' : '#900',
  iconColor: theme === 'dark' ? Colors.WHITE : Colors.BLACK,
  headerColor: theme === 'dark' ? Colors.WHITE : Colors.BLACK,
});
