import React from "react"      
import { Image, StyleSheet, View } from "react-native"


const ProfilePicture = ({imageSource, size = 50}) => {
    const styles = StyleSheet.create ({
        pfp: {
            width: size * 0.8,
            height: size * 0.8,
            resizeMode: 'contain',
        },    
        pfpContainer: {
            width: size,
            height: size,
            resizeMode: 'contain',
            alignItems: 'center',
            justifyContent: 'center'
        }
    });
    
    return (
        <View style={styles.pfpContainer}>
            <Image style={styles.pfp} source={imageSource} />
        </View>
    )
};

export default ProfilePicture;
                    