package z.reactnative.iptvplayer;

import android.support.multidex.MultiDexApplication;

import com.facebook.react.ReactPackage;

import com.facebook.react.shell.MainReactPackage;
import com.ghondar.vlcplayer.*;

import java.util.Arrays;
import java.util.List;

// Needed for `react-native link`
// import com.facebook.react.ReactApplication;
import com.github.yamill.orientation.OrientationPackage;
//import com.vlcplayer.VLCPlayerPackage;

public class MainApplication extends MultiDexApplication {

  // Needed for `react-native link`
  public List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
            new VLCPlayerPackage(),
        // Add your own packages here!
        // TODO: add cool native modules

        // Needed for `react-native link`
        // new MainReactPackage(),
            new OrientationPackage()
    );
  }
}
