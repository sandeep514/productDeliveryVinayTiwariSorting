import React, { useEffect } from 'react';
import { Input, Icon } from '@rneui/themed';

const InputComponent = (props) => {
	return (	
        (props.icon)?
            <Input
                placeholder={props.placeholder}
                leftIcon={{ type: 'font-awesome', name: props.iconName}}
                onChangeText={value => {}}
                secureTextEntry={props.secureTextBox}
            />
        :
            <Input
                placeholder={props.placeholder}
                leftIcon={{ type: 'font-awesome', name: props.iconName}}
                onChangeText={value => {}}
                secureTextEntry={props.secureTextBox}
            />
    
	);
};

export default InputComponent;
