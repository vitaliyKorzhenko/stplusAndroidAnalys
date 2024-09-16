import React from 'react';
import { makeStyles, shorthands, Image } from '@fluentui/react-components';
// Создаем стили для иконки
const useStyles = makeStyles({
  icon: {
    width: '32px', // задайте размер иконки
    height: '32px', // задайте размер иконки
    ...shorthands.margin('2px'),
    ...shorthands.padding('5px'),
  },
});

interface CustomIconProps {
    id: string;
    isLight?: boolean;
}

const CustomIcon: React.FC <CustomIconProps> = (props) => {
  const classes = useStyles();

  let iconLightPath = `https://statplus.io/account/light/toolbar_icon_${props.id}.png`;

  let iconDarkPath = `https://statplus.io/account/dark/toolbar_icon_${props.id}.png`;

  let path = props.isLight ? iconLightPath : iconDarkPath;
  console.log('Icon path:', path);
  return (
    <Image src={path} className={classes.icon} />
  );
};

export default CustomIcon;
