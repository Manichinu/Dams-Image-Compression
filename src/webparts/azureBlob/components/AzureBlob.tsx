import * as React from 'react';
// import './AzureBlob.module.scss';
import './Style.css'
import type { IAzureBlobProps } from './IAzureBlobProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import * as $ from "jquery";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/attachments";
import "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/webs";
// import { ImageCompressor } from 'image-compressor';
import { SPComponentLoader } from "@microsoft/sp-loader";
import Swal from "sweetalert2";
import * as CryptoJS from 'crypto-js';




var NewWeb: any;

export interface FileState {
  Images: any[];
  ShareOptions: boolean;
  Sharebtn: boolean;
}

export default class AzureBlob extends React.Component<IAzureBlobProps, FileState, {}> {
  public constructor(props: IAzureBlobProps, state: FileState) {
    super(props)
    this.state = {
      Images: [],
      ShareOptions: false,
      Sharebtn: true
    }
    NewWeb = Web("" + this.props.siteurl + "")
    SPComponentLoader.loadCss(
      `https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css`
    );

    SPComponentLoader.loadCss(
      `https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css`
    );

    SPComponentLoader.loadScript(
      `https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.js`
    );
  }
  public componentDidMount() {
    this.GetCurrentUserDetails()
    this.getFiles()
  }
  public async GetCurrentUserDetails() {
    await NewWeb.currentUser.get().then((user: any) => {
      console.log("UserDetails", user);
    }, (errorResponse: any) => {
    }
    );
  }

  public async uploadFile() {
    var FileInput: any = $("#files");
    var Files = FileInput[0].files[0];

    // Compress the image before uploading
    const compressedFile = await this.compressImage(Files);
    await NewWeb.getFolderByServerRelativeUrl(
      this.props.context.pageContext.web.serverRelativeUrl + `/Original Images`
    ).files.add(Files.name, Files, true)

    await NewWeb.getFolderByServerRelativeUrl(
      this.props.context.pageContext.web.serverRelativeUrl + `/Compression Images`
    ).files.add(compressedFile.name, compressedFile, true).then(() => {
      alert("Success");
      this.getFiles()
    });
  }

  private async compressImage(imageFile: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const maxWidth = 1920;
      const maxHeight = 1080;
      const quality = 0.8;

      const img = new Image();
      img.src = URL.createObjectURL(imageFile);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert the canvas to Blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Set the filename and resolve the Promise
            const compressedFile = new File([blob], imageFile.name, { type: 'image/jpeg', lastModified: Date.now() });
            resolve(compressedFile);
          } else {
            reject(new Error('Image compression failed'));
          }
        }, 'image/jpeg', quality);
      };

      img.onerror = () => {
        reject(new Error('Failed to load the image'));
      };
    });
  }
  public getFiles() {
    NewWeb.lists.getByTitle('Compression Images')
      .items
      .select('*')
      .expand("File")
      .get()
      .then((files: any) => {
        this.setState({
          Images: files
        })
        console.log(files)
      })
  }
  public showShareOptions() {
    this.setState({
      Sharebtn: false,
      ShareOptions: true
    })
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
  public externalInvite() {
    var Email: any;
    Swal.fire({
      title: "<p>Enter Email Address</p>",
      html: "<input type='text' id='email' />",
      confirmButtonText: "Submit",
      customClass: {
        container: 'cancel-date',
      },
      showCloseButton: true,
      allowOutsideClick: true,
      preConfirm: () => {
        Email = $("#email").val();
        if (Email == "") {
          Swal.showValidationMessage("Please enter email");
        }
        return Email;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        var email = Email;
        var hashedEmail = CryptoJS.SHA256(email).toString(CryptoJS.enc.Hex);
        var FileID = await this.generateRandomNumber()
        NewWeb.lists.getByTitle('External User Transaction').items.add({
          Title: Email,
          AccessToken: hashedEmail,
          FileID: FileID,
          URL: `https://6z0l7v.sharepoint.com/sites/sptest/SitePages/UserValidation.aspx?AccessToken=${hashedEmail}&Fileid=${FileID}`
        }).then(() => {
          Swal.fire({
            text: "Submitted successfully!",
            icon: "success"
          }).then(() => {
            location.reload()
          })
        })
      }
    });
  }
  public render(): React.ReactElement<IAzureBlobProps> {
    // const ImageFiles = this.state.Images.map((item: any) => {
    //   return (
    //     <img src={item.File.ServerRelativeUrl} style={{ width: "200px", height: "200px" }} />
    //   )
    // })
    return (
      <>
        {/* <input type='file' id="files" />
        <button onClick={() => this.uploadFile()}>Submit</button>
        <div>{ImageFiles}</div> */}
        {this.state.Sharebtn == true &&
          <button type="button" className="btn btn-info" onClick={() => this.showShareOptions()}>Share it</button>
        }
        {this.state.ShareOptions == true &&
          <>
            <button type="button" className="btn btn-secondary">Anyone</button>
            <button type="button" className="btn btn-primary">Internal</button>
            <button type="button" className="btn btn-warning" onClick={() => this.externalInvite()}>External</button>

          </>
        }
      </>
    );
  }
}
