import * as React from 'react';
import './UserValidation.module.scss';
import type { IUserValidationProps } from './IUserValidationProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import '../../azureBlob/components/Style.css';
import Swal from "sweetalert2";
import * as $ from "jquery";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/attachments";
import "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/webs";


var NewWeb: any;
var accessToken: any;
var Fileid: any;
var generatedOTP: any;


export default class UserValidation extends React.Component<IUserValidationProps, {}> {
  public constructor(props: IUserValidationProps) {
    super(props);
    NewWeb = Web("" + this.props.siteurl + "")
    console.log(NewWeb)
  }
  public componentDidMount() {
    const searchParams = new URLSearchParams(window.location.search);
    accessToken = searchParams.get("AccessToken");
    Fileid = searchParams.get("Fileid");
    this.emailValidation()
  }
  public emailValidation() {
    var Email: any;
    var OTP: any;

    Swal.fire({
      title: "<p>Enter Email Address</p>",
      html: "<input type='text' id='email' />",
      confirmButtonText: "Submit",
      allowOutsideClick: true,
      preConfirm: () => {
        Email = $("#email").val();
        if (Email == "") {
          Swal.showValidationMessage("Please enter email");
        }
        return Email;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        NewWeb.lists.getByTitle('External User Transaction').items.filter(`Title eq '${Email}' and AccessToken eq '${accessToken}' and FileID eq '${Fileid}'`).get().then(async (items: any) => {
          if (items.length != 0) {
            generatedOTP = await this.generateRandomNumber();
            console.log(generatedOTP)
            Swal.fire({
              title: "<p>Enter OTP</p>",
              html: "<input type='text' id='otp' />",
              confirmButtonText: "Submit",
              allowOutsideClick: true,
              preConfirm: () => {
                OTP = $("#otp").val();
                if (OTP == "") {
                  Swal.showValidationMessage("Please enter otp");
                }
                return OTP;
              },
            }).then((result) => {
              if (result.isConfirmed) {
                if (generatedOTP == OTP) {
                  Swal.fire({
                    text: "OTP matched!",
                    icon: "success"
                  })
                } else {
                  Swal.fire({
                    icon: "error",
                    text: "OTP not matched!",
                  });
                }
              }
            })
          } else {
            Swal.fire({
              icon: "error",
              text: "Email not found!",
            });
          }
        })


      }
    });
  }
  public async generateRandomNumber() {
    const length = 8;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }
 
  public render(): React.ReactElement<IUserValidationProps> {
    // const {
    //   description,
    //   isDarkTheme,
    //   environmentMessage,
    //   hasTeamsContext,
    //   userDisplayName
    // } = this.props;


    return (
      <>

      </>
    );
  }
}
